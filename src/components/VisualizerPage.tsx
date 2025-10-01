import { useState, useEffect } from 'react';
import { Layers, Shield, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Block, EvidenceRecord } from '../types';
import { storage } from '../lib/storage';
import { getBlockStats } from '../lib/blockchain';

export default function VisualizerPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  useEffect(() => {
    const allBlocks = storage.getBlocks();
    const allEvidence = storage.getEvidence();
    setBlocks(allBlocks);
    setEvidence(allEvidence);
  }, []);

  const stats = getBlockStats(blocks, evidence);

  const getBlockEvidence = (blockId: string) => {
    return evidence.filter((e) => e.blockId === blockId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Blockchain Visualizer</h1>
        <p className="text-gray-400">Interactive view of the immutable evidence ledger</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-5 h-5 text-sapphire-500" />
            <span className="text-2xl font-bold text-white">{stats.totalBlocks}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Blocks</p>
        </div>

        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-sapphire-500" />
            <span className="text-2xl font-bold text-white">{stats.totalEvidence}</span>
          </div>
          <p className="text-gray-400 text-sm">Evidence Records</p>
        </div>

        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            {stats.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-2xl font-bold ${stats.isValid ? 'text-green-400' : 'text-red-400'}`}>
              {stats.isValid ? 'VALID' : 'INVALID'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Chain Integrity</p>
        </div>

        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-sapphire-500" />
            <span className="text-2xl font-bold text-white">
              #{stats.latestBlock?.blockNumber || 0}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Latest Block</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-sapphire-500" />
            Blockchain Structure
          </h2>

          <div className="space-y-4">
            {blocks.map((block, index) => {
              const blockEvidence = getBlockEvidence(block.id);
              const isHovered = hoveredBlock === block.id;
              const isSelected = selectedBlock?.id === block.id;

              return (
                <div key={block.id} className="flex items-center">
                  {index > 0 && (
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-px h-8 bg-sapphire-600/30"></div>
                      <div className="text-sapphire-500 text-xs">↓</div>
                    </div>
                  )}

                  <div
                    className={`flex-1 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'ring-2 ring-sapphire-600 '
                        : isHovered
                        ? 'ring-1 ring-sapphire-600/50 '
                        : ''
                    }`}
                    onMouseEnter={() => setHoveredBlock(block.id)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="relative bg-charcoal-950 border border-charcoal-800 rounded-lg p-6 hover:border-sapphire-600/50 transition-all">
                      {block.blockNumber === 0 && (
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-sapphire-600 text-white text-xs font-bold rounded-full">
                          GENESIS
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-sapphire-600/10 border border-sapphire-600/30 rounded-lg flex items-center justify-center">
                            <Lock className="w-6 h-6 text-sapphire-500" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              Block #{block.blockNumber}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {new Date(block.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {blockEvidence.length > 0 && (
                          <div className="px-3 py-1 bg-sapphire-600/10 border border-sapphire-600/30 rounded-full">
                            <span className="text-sapphire-500 text-xs font-semibold">
                              {blockEvidence.length} Evidence
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Block Hash</p>
                          <p className="text-sapphire-500 font-mono text-xs break-all">
                            {block.hash.slice(0, 16)}...
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Previous Hash</p>
                          <p className="text-gray-400 font-mono text-xs break-all">
                            {block.previousHash.slice(0, 16)}...
                          </p>
                        </div>
                      </div>

                      {(isHovered || isSelected) && blockEvidence.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-charcoal-800">
                          <p className="text-gray-400 text-xs mb-2">Evidence in this block:</p>
                          <div className="space-y-1">
                            {blockEvidence.map((e) => (
                              <div key={e.id} className="text-xs text-gray-500">
                                • {e.caseId}: {e.fileName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-sapphire-500" />
              Block Details
            </h2>

            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Block Number</p>
                  <p className="text-white font-semibold text-2xl">#{selectedBlock.blockNumber}</p>
                </div>

                <div className="border-t border-charcoal-800 pt-4">
                  <p className="text-gray-500 text-sm mb-2">Full Hash</p>
                  <p className="text-sapphire-500 font-mono text-xs break-all bg-charcoal-950 p-3 rounded border border-charcoal-800">
                    {selectedBlock.hash}
                  </p>
                </div>

                <div className="border-t border-charcoal-800 pt-4">
                  <p className="text-gray-500 text-sm mb-2">Previous Hash</p>
                  <p className="text-gray-400 font-mono text-xs break-all bg-charcoal-950 p-3 rounded border border-charcoal-800">
                    {selectedBlock.previousHash}
                  </p>
                </div>

                <div className="border-t border-charcoal-800 pt-4">
                  <p className="text-gray-500 text-sm mb-2">Data Hash</p>
                  <p className="text-gray-400 font-mono text-xs break-all bg-charcoal-950 p-3 rounded border border-charcoal-800">
                    {selectedBlock.dataHash}
                  </p>
                </div>

                <div className="border-t border-charcoal-800 pt-4">
                  <p className="text-gray-500 text-sm mb-1">Timestamp</p>
                  <p className="text-white">
                    {new Date(selectedBlock.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(selectedBlock.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {getBlockEvidence(selectedBlock.id).length > 0 && (
                  <div className="border-t border-charcoal-800 pt-4">
                    <p className="text-gray-500 text-sm mb-2">Evidence Records</p>
                    <div className="space-y-2">
                      {getBlockEvidence(selectedBlock.id).map((e) => (
                        <div
                          key={e.id}
                          className="bg-charcoal-950 p-3 rounded border border-charcoal-800"
                        >
                          <p className="text-white text-sm font-medium">{e.caseId}</p>
                          <p className="text-gray-400 text-xs mt-1">{e.fileName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Select a block to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}