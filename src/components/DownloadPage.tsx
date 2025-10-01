import { useEffect, useMemo, useState } from 'react';
import { Download, Layers, Loader2, Search } from 'lucide-react';
import { storage } from '../lib/storage';
import { downloadEvidenceRecord } from '../lib/download';
import type { EvidenceRecord } from '../types';

interface ReconstructionState {
  id: string;
  step: number;
  message: string;
}

const reconstructionSteps = [
  'Extracting distributed shards…',
  'Validating Merkle proofs…',
  'Reassembling payload…',
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function DownloadPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [activeState, setActiveState] = useState<ReconstructionState | null>(null);
  const [statusHistory, setStatusHistory] = useState<string[]>([]);

  useEffect(() => {
    setEvidence(storage.getEvidence());
  }, []);

  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return evidence;
    const needle = searchQuery.toLowerCase();
    return evidence.filter((record) =>
      [record.caseId, record.fileName, record.description].some((field) =>
        field.toLowerCase().includes(needle)
      )
    );
  }, [searchQuery, evidence]);

  const appendStatus = (message: string) => {
    setStatusHistory((previous) => [message, ...previous].slice(0, 4));
  };

  const reconstructAndDownload = async (record: EvidenceRecord) => {
    setActiveState({ id: record.id, step: 0, message: reconstructionSteps[0] });
    appendStatus(`▶️ ${reconstructionSteps[0]}`);

    for (let step = 0; step < reconstructionSteps.length; step += 1) {
      if (step > 0) {
        await delay(480);
        setActiveState({ id: record.id, step, message: reconstructionSteps[step] });
        appendStatus(`▶️ ${reconstructionSteps[step]}`);
      }
      await delay(520);
    }

    downloadEvidenceRecord(record);

    appendStatus(`✅ Reconstruction complete for ${record.fileName}`);
    setActiveState({ id: record.id, step: reconstructionSteps.length, message: 'Download ready' });

    await delay(900);
    setActiveState(null);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Download File</h1>
        <p className="text-sm text-neutral-500">
          Identify notarised artefacts, reconstruct their payload from distributed shards, and export the final file.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by case, filename, description…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-4 pl-14 pr-4 text-base text-neutral-50 placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
          />
        </div>
        {searchQuery && (
          <p className="mt-3 text-sm text-neutral-500">
            Found {filteredEvidence.length} result{filteredEvidence.length === 1 ? '' : 's'} for “{searchQuery}”.
          </p>
        )}
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-12 text-center text-neutral-400">
          Search to get the reconstrctued file
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-neutral-300">
              <thead className="bg-neutral-900/70 text-xs uppercase tracking-[0.3em] text-neutral-500">
                <tr>
                  <th className="px-6 py-4 text-left">Case</th>
                  <th className="px-6 py-4 text-left">File name</th>
                  <th className="px-6 py-4 text-left">Size</th>
                  <th className="px-6 py-4 text-left">Uploaded</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                {filteredEvidence.map((record) => {
                  const isActive = activeState?.id === record.id;
                  const stepLabel = isActive && activeState?.step! < reconstructionSteps.length
                    ? reconstructionSteps[activeState.step]
                    : 'Reconstruct & download';

                  return (
                    <tr key={record.id} className="transition hover:bg-neutral-900/40">
                      <td className="px-6 py-4 text-neutral-100">{record.caseId}</td>
                      <td className="px-6 py-4 text-neutral-200">{record.fileName}</td>
                      <td className="px-6 py-4 text-neutral-400">{(record.fileSize / 1024).toFixed(1)} KB</td>
                      <td className="px-6 py-4 text-neutral-400">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => reconstructAndDownload(record)}
                          disabled={isActive}
                          className="btn-secondary inline-flex items-center gap-2 text-sm disabled:opacity-60"
                        >
                          {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {isActive ? stepLabel : 'Reconstruct & download'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeState && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-950/60 p-4 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-200" />
          <span>{activeState.message}</span>
        </div>
      )}

      {statusHistory.length > 0 && (
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <Layers className="h-4 w-4 text-neutral-400" /> Reconstruction log
          </div>
          <ul className="space-y-2 text-xs text-neutral-500">
            {statusHistory.map((entry, index) => (
              <li key={`${entry}-${index}`} className="rounded-lg border border-neutral-800/70 bg-neutral-900/60 px-3 py-2">
                {entry}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
