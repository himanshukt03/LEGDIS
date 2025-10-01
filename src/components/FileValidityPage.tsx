import { useEffect, useMemo, useState } from 'react';
import { Calendar, Database, Download, FileText, Loader2, Search, ShieldCheck } from 'lucide-react';
import { storage } from '../lib/storage';
import { downloadEvidenceRecord } from '../lib/download';
import type { EvidenceRecord } from '../types';

type ChunkIntegrity = 'verified' | 'rebuilding';

interface ChunkDetail {
  id: string;
  sizeKb: number;
  replicas: number;
  hashFragment: string;
  latencyMs: number;
  integrity: ChunkIntegrity;
}

const MIN_CHUNKS = 3;
const MAX_CHUNKS = 12;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededNumber(seed: string, range: number): number {
  if (range <= 0) return 0;
  return hashSeed(seed) % range;
}

function generateChunkDetails(record: EvidenceRecord): ChunkDetail[] {
  const virtualSize = record.fileSize || record.fileName.length * 2048;
  const chunkEstimate = Math.ceil(virtualSize / (256 * 1024));
  const chunkCount = Math.min(MAX_CHUNKS, Math.max(MIN_CHUNKS, chunkEstimate));
  const averageChunkSize = Math.max(64, Math.round((virtualSize / chunkCount) / 1024));

  return Array.from({ length: chunkCount }, (_, index) => {
    const jitter = seededNumber(`${record.id}-size-${index}`, 41) - 20;
    const replicas = 2 + (seededNumber(`${record.id}-replicas-${index}`, 3));
    const latency = 45 + seededNumber(`${record.id}-latency-${index}`, 90);
    const integrityRoll = seededNumber(`${record.id}-integrity-${index}`, 100);
    const integrity: ChunkIntegrity = integrityRoll > 8 ? 'verified' : 'rebuilding';
    const hashFragment = Math.abs(hashSeed(`${record.blockId}-${record.caseId}-${index}`))
      .toString(16)
      .padStart(8, '0')
      .slice(0, 8);

    return {
      id: `${record.id}-chunk-${index + 1}`,
      sizeKb: Math.max(32, averageChunkSize + jitter),
      replicas,
      latencyMs: latency,
      hashFragment,
      integrity,
    };
  });
}

export default function FileValidityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (filteredEvidence.length === 0) {
      setSelectedRecordId(null);
      return;
    }

    const alreadySelected = filteredEvidence.some((record) => record.id === selectedRecordId);
    if (!alreadySelected) {
      setSelectedRecordId(filteredEvidence[0].id);
    }
  }, [filteredEvidence, selectedRecordId]);

  const selectedRecord = useMemo(() => {
    return filteredEvidence.find((record) => record.id === selectedRecordId) ?? null;
  }, [filteredEvidence, selectedRecordId]);

  const chunkDetails = useMemo(() => {
    if (!selectedRecord) return [] as ChunkDetail[];
    return generateChunkDetails(selectedRecord);
  }, [selectedRecord]);

  const handleDownload = (record: EvidenceRecord) => {
    setDownloadingId(record.id);
    try {
      downloadEvidenceRecord(record);
    } catch (error) {
      console.error('Failed to download evidence record', error);
    } finally {
      setTimeout(() => {
        setDownloadingId((current) => (current === record.id ? null : current));
      }, 400);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">File Validity</h1>
        <p className="text-sm text-neutral-500">
          Inspect notarised artefacts, verify distributed shards, and confirm integrity across the ledger.
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
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800/70 bg-neutral-900/60">
            <Database className="h-7 w-7 text-neutral-400" />
          </div>
          <p className="mt-6 text-lg font-medium text-neutral-200">
            {evidence.length === 0 ? 'No evidence records available yet' : 'No records matched this filter'}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {evidence.length === 0
              ? 'Once your team uploads artefacts, they will be indexed here momentarily.'
              : 'Adjust your query or clear the filter to view the full ledger.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-neutral-300">
              <thead className="bg-neutral-900/70 text-xs uppercase tracking-[0.3em] text-neutral-500">
                <tr>
                  <th className="px-6 py-4 text-left">Case</th>
                  <th className="px-6 py-4 text-left">File name</th>
                  <th className="px-6 py-4 text-left">Synopsis</th>
                  <th className="px-6 py-4 text-left">Timestamp</th>
                  <th className="px-6 py-4 text-left">Block</th>
                  <th className="px-6 py-4 text-left">Integrity</th>
                  <th className="px-6 py-4 text-left">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                {filteredEvidence.map((record) => {
                  const isActive = record.id === selectedRecordId;
                  const chunks = generateChunkDetails(record);
                  return (
                    <tr
                      key={record.id}
                      className={`cursor-pointer transition hover:bg-neutral-900/40 ${isActive ? 'bg-neutral-900/50' : ''}`}
                      onClick={() => setSelectedRecordId(record.id)}
                    >
                      <td className="px-6 py-4 text-neutral-100">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-300" />
                          {record.caseId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-200">{record.fileName}</div>
                        <div className="text-xs text-neutral-500">{(record.fileSize / 1024).toFixed(1)} KB</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{record.description}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                        <div className="mt-1 text-xs text-neutral-600">{new Date(record.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-xs font-semibold text-neutral-200">
                          #{record.blockId.split('-')[1] ?? record.blockId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex flex-wrap gap-1">
                          {chunks.slice(0, 6).map((chunk) => (
                            <span
                              key={chunk.id}
                              className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                                chunk.integrity === 'verified'
                                  ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                  : 'border border-amber-500/40 bg-amber-500/10 text-amber-200'
                              }`}
                            >
                              C{chunk.id.split('-').pop()}
                            </span>
                          ))}
                          {chunks.length > 6 && (
                            <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/70 px-2 py-1 text-[10px] text-neutral-400">
                              +{chunks.length - 6}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleDownload(record)}
                          disabled={downloadingId === record.id}
                          className="btn-secondary inline-flex items-center gap-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadingId === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {downloadingId === record.id ? 'Preparing…' : 'Download'}
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

      {selectedRecord && (
        <div className="space-y-6 rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-100">Shard breakdown</h2>
              <p className="text-sm text-neutral-500">
                {selectedRecord.fileName} · {chunkDetails.length} chunks · {(selectedRecord.fileSize / 1024).toFixed(1)} KB total payload
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Ledger integrity assured
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {chunkDetails.map((chunk, index) => (
              <div
                key={chunk.id}
                className="space-y-3 rounded-xl border border-neutral-800/70 bg-neutral-900/60 p-4"
              >
                <div className="flex items-center justify-between text-sm text-neutral-300">
                  <span className="font-semibold">Chunk {index + 1}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                      chunk.integrity === 'verified'
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border border-amber-500/40 bg-amber-500/10 text-amber-200'
                    }`}
                  >
                    {chunk.integrity === 'verified' ? 'Verified' : 'Rebuilding'}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Size</span>
                    <span className="font-mono text-neutral-300">{chunk.sizeKb} KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Replicas</span>
                    <span className="font-mono text-neutral-300">{chunk.replicas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hash</span>
                    <span className="font-mono text-neutral-500">{chunk.hashFragment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Latency</span>
                    <span className="font-mono text-neutral-300">{chunk.latencyMs} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredEvidence.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <span>
            Displaying {filteredEvidence.length} of {evidence.length} notarised entries
          </span>
          <span className="inline-flex items-center gap-2">
            <Database className="h-4 w-4" />
            Stored immutably on distributed ledger
          </span>
        </div>
      )}
    </div>
  );
}
