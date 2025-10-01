import { useState } from 'react';
import { Shield, Lock, Key, ArrowLeft } from 'lucide-react';
import { Node } from '../types';
import { storage } from '../lib/storage';

interface LoginPageProps {
  onLogin: (node: Node) => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [nodeId, setNodeId] = useState('');
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nodeId || !key) {
      setError('Please enter both Node ID and Key');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (nodeId === 'NODE001' && key === 'SECURE_KEY_123') {
        const node: Node = {
          id: 'node-1',
          nodeId: nodeId,
          name: 'Law Enforcement Agency',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        storage.setCurrentNode(node);
        onLogin(node);
      } else {
        setError('Invalid credentials. Try NODE001 / SECURE_KEY_123');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-sapphire-900/30 border border-sapphire-700/50 rounded-xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-sapphire-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            LEDGIS
          </h1>
          <p className="text-gray-400">
            Sign in to access the blockchain network
          </p>
        </div>

        <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nodeId" className="block text-sm font-medium text-gray-300 mb-2">
                Node ID
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="nodeId"
                  type="text"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-600 transition-colors"
                  placeholder="Enter your node identifier"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-2">
                Authentication Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="key"
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-600 transition-colors"
                  placeholder="Enter your authentication key"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect to Network'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-800">
            <p className="text-xs text-gray-500 text-center">
              Demo Credentials: NODE001 / SECURE_KEY_123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}