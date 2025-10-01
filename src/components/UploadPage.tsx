import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Node, EvidenceRecord, UploadProgress } from '../types';
import { storage } from '../lib/storage';
import { createBlock } from '../lib/blockchain';

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseId || !description || !selectedFile) {
      return;
    }

    setUploadProgress({
      fileName: selectedFile.name,
      progress: 0,
      status: 'uploading',
    });

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev) return null;
        const newProgress = Math.min(prev.progress + 10, 90);
        return { ...prev, progress: newProgress };
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);

      const evidenceId = `evidence-${Date.now()}`;
      const blocks = storage.getBlocks();
      const latestBlock = blocks[blocks.length - 1];

      const newBlock = createBlock(
        latestBlock.blockNumber + 1,
        latestBlock.hash,
        [evidenceId],
        currentNode.id
      );
      storage.addBlock(newBlock);

      const evidence: EvidenceRecord = {
        id: evidenceId,
        caseId,
        fileName: selectedFile.name,
        filePath: `/evidence/${evidenceId}`,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        description,
        uploadedBy: currentNode.id,
        blockId: newBlock.id,
        createdAt: new Date().toISOString(),
        uploaderName: currentNode.name,
      };

      storage.addEvidence(evidence);
      setRecentUploads((prev) => [evidence, ...prev]);

      setUploadProgress({
        fileName: selectedFile.name,
        progress: 100,
        status: 'completed',
      });

      setTimeout(() => {
        setUploadProgress(null);
        setCaseId('');
        setDescription('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Secure File Upload</h1>
        <p className="text-gray-400">Upload evidence files to the blockchain ledger</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8 space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-sapphire-600 bg-sapphire-900/10'
              : selectedFile
              ? 'border-sapphire-600 bg-sapphire-900/10'
              : 'border-charcoal-700 hover:border-sapphire-600/50 hover:bg-charcoal-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className={`w-16 h-16 mx-auto mb-4 ${selectedFile ? 'text-sapphire-500' : 'text-gray-600'}`} />
          {selectedFile ? (
            <div>
              <p className="text-white font-medium mb-1">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / 1024).toFixed(2)} KB - {selectedFile.type || 'Unknown type'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white mb-2">Drop your file here or click to browse</p>
              <p className="text-gray-500 text-sm">Supports all file types</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="caseId" className="block text-sm font-medium text-gray-300 mb-2">
              Case ID
            </label>
            <input
              id="caseId"
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-600 transition-colors"
              placeholder="e.g., CASE-2024-001"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-600 transition-colors"
              placeholder="Brief description"
              required
            />
          </div>
        </div>

        {uploadProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{uploadProgress.fileName}</span>
              <span className="text-sapphire-500">{uploadProgress.progress}%</span>
            </div>
            <div className="w-full bg-charcoal-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-sapphire-600 transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            {uploadProgress.status === 'completed' && (
              <div className="flex items-center text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Upload completed and added to blockchain
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!caseId || !description || !selectedFile || uploadProgress !== null}
          className="w-full bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload to Blockchain
        </button>
      </form>

      {recentUploads.length > 0 && (
        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Recent Uploads
          </h2>
          <div className="space-y-3">
            {recentUploads.slice(0, 5).map((evidence) => (
              <div
                key={evidence.id}
                className="flex items-center justify-between p-4 bg-charcoal-950 rounded-lg border border-charcoal-800"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-sapphire-500" />
                  <div>
                    <p className="text-white font-medium">{evidence.fileName}</p>
                    <p className="text-gray-500 text-sm">Case: {evidence.caseId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sapphire-500 text-sm font-medium">Block #{evidence.blockId.split('-')[1]}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(evidence.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}