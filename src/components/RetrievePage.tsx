import { useEffect, useMemo, useState } from 'react';
import { Calendar, Database, Download, FileText, Search } from 'lucide-react';
import { storage } from '../lib/storage';
import { EvidenceRecord } from '../types';

export default function RetrievePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    const populated = storage.getEvidence();
    setEvidence(populated);
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

  const handleDownload = (record: EvidenceRecord) => {
    const payload = `Evidence File: ${record.fileName}\nCase ID: ${record.caseId}\nDescription: ${record.description}`;
    const blob = new Blob([payload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = record.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Ledger retrieval</h1>
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
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60">
                {filteredEvidence.map((record) => (
                  <tr key={record.id} className="transition hover:bg-neutral-900/40">
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
                        #{record.blockId.split('-')[1]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(record)}
                        className="btn-secondary inline-flex items-center gap-2 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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