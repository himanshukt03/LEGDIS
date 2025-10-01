import { useState, useEffect } from 'react';
import { Search, Download, FileText, Calendar, Database } from 'lucide-react';
import { EvidenceRecord } from '../types';
import { storage } from '../lib/storage';

export default function RetrievePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [filteredEvidence, setFilteredEvidence] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    const allEvidence = storage.getEvidence();
    setEvidence(allEvidence);
    setFilteredEvidence(allEvidence);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvidence(evidence);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = evidence.filter(
      (record) =>
        record.caseId.toLowerCase().includes(query) ||
        record.fileName.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query)
    );
    setFilteredEvidence(filtered);
  }, [searchQuery, evidence]);

  const handleDownload = (record: EvidenceRecord) => {
    const blob = new Blob([`Evidence File: ${record.fileName}\nCase ID: ${record.caseId}\nDescription: ${record.description}`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Retrieve Evidence</h1>
        <p className="text-gray-400">Search and download evidence files from the blockchain</p>
      </div>

      <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-600 transition-colors text-lg"
            placeholder="Search by Case ID, file name, or description..."
          />
        </div>

        {searchQuery && (
          <div className="mt-4 text-sm text-gray-400">
            Found {filteredEvidence.length} result{filteredEvidence.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-12 text-center">
          <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {evidence.length === 0 ? 'No evidence records found' : 'No results match your search'}
          </p>
          <p className="text-gray-600 text-sm">
            {evidence.length === 0
              ? 'Upload evidence files to see them here'
              : 'Try different search terms'}
          </p>
        </div>
      ) : (
        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-800 bg-charcoal-800/50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {filteredEvidence.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-charcoal-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-sapphire-500 mr-2" />
                        <span className="text-white font-medium">{record.caseId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{record.fileName}</span>
                      <div className="text-xs text-gray-600 mt-1">
                        {(record.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">{record.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sapphire-900/20 text-sapphire-500 border border-sapphire-700/50">
                        #{record.blockId.split('-')[1]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(record)}
                        className="inline-flex items-center px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
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
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredEvidence.length} of {evidence.length} total records
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>All records stored on immutable blockchain</span>
          </div>
        </div>
      )}
    </div>
  );
}