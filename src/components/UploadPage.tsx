import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import { createBlock } from '../lib/blockchain';
import { storage } from '../lib/storage';
import { EvidenceRecord, Node, UploadProgress } from '../types';

interface UploadPageProps {
  currentNode: Node;
}

export default function UploadPage({ currentNode }: UploadPageProps) {
  const [caseId, setCaseId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [recentUploads, setRecentUploads] = useState<EvidenceRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const beginUpload = () => {
    if (!selectedFile) return;

    setUploadProgress({ fileName: selectedFile.name, progress: 0, status: 'uploading' });

    const interval = setInterval(() => {
      setUploadProgress((previous) => {
        if (!previous) return null;
        const nextProgress = Math.min(previous.progress + 12, 88);
        return { ...previous, progress: nextProgress };
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      const evidenceId = `evidence-${Date.now()}`;
      const blocks = storage.getBlocks();
      const latestBlock = blocks[blocks.length - 1];

      const newBlock = createBlock(latestBlock.blockNumber + 1, latestBlock.hash, [evidenceId], currentNode.id);
      storage.addBlock(newBlock);

      const record: EvidenceRecord = {
        id: evidenceId,
        caseId,
        fileName: selectedFile.name,
        filePath: `/evidence/${evidenceId}`,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        description,
        uploadedBy: currentNode.id,
        uploaderName: currentNode.name,
        blockId: newBlock.id,
        createdAt: new Date().toISOString(),
      };

      storage.addEvidence(record);
      setRecentUploads((existing) => [record, ...existing]);

      setUploadProgress({ fileName: selectedFile.name, progress: 100, status: 'completed' });

      setTimeout(() => {
        setUploadProgress(null);
        setCaseId('');
        setDescription('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }, 2000);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseId || !description || !selectedFile) return;
    beginUpload();
  };

  return (
    <div className="relative space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Evidence Upload</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-8 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)]">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) setSelectedFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-2xl border border-dashed px-5 py-10 text-center transition ${
            selectedFile
              ? 'border-neutral-200/40 bg-neutral-900/60'
              : isDragging
              ? 'border-neutral-100/60 bg-neutral-900/60'
              : 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50'
          }`}
        >
          <input ref={fileInputRef} type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className="hidden" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-neutral-700/70 bg-neutral-900/70">
            <Upload className="h-8 w-8 text-neutral-200" />
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-lg font-medium text-neutral-100">Drop evidence or browse your workstation</p>
            <p className="text-sm text-neutral-500">We accept forensic images, media, archives, and structured exports.</p>
          </div>
          {selectedFile && (
            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-300">
              <p className="font-medium text-neutral-100">{selectedFile.name}</p>
              <p className="text-neutral-500">{(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'unknown type'}</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-neutral-200">Case reference</span>
            <input
              value={caseId}
              onChange={(event) => setCaseId(event.target.value)}
              placeholder="e.g. CASE-2025-014"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-neutral-50 placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-neutral-200">Evidence synopsis</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Brief description"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-neutral-50 placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
              required
            />
          </label>
        </div>

        {uploadProgress && (
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/50 p-5">
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span>{uploadProgress.fileName}</span>
              <span className="text-neutral-100">{uploadProgress.progress}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full rounded-full bg-neutral-100 transition-all" style={{ width: `${uploadProgress.progress}%` }} />
            </div>
            {uploadProgress.status === 'completed' && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Anchored to blockchain
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!caseId || !description || !selectedFile || uploadProgress !== null}
          className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          Commit evidence to ledger
        </button>
      </form>

      {recentUploads.length > 0 && (
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-100">Recent notarisation</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">latest five</span>
          </div>
          <div className="space-y-3">
            {recentUploads.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60">
                    <FileText className="h-5 w-5 text-neutral-200" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-100">{record.fileName}</p>
                    <p className="text-xs text-neutral-500">Case {record.caseId}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-500">
                  <p>Block #{record.blockId.split('-')[1]}</p>
                  <p>{new Date(record.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}