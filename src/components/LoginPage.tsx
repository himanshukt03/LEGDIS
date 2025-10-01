import { useState } from 'react';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Node } from '../types';
import { storage } from '../lib/storage';

interface LoginPageProps {
  onLogin: (node: Node) => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [nodeId, setNodeId] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
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
        setError('Invalid credentials');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-sapphire-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))]"></div>

      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-sapphire-500/30 blur-2xl rounded-full"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-sapphire-500 to-sapphire-600 rounded-2xl flex items-center justify-center transform rotate-3">
                <Shield className="w-9 h-9 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to access your blockchain network</p>
        </div>

        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nodeId" className="block text-sm font-medium text-gray-300 mb-2">
                Node ID
              </label>
              <input
                id="nodeId"
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500 focus:ring-2 focus:ring-sapphire-500/20 transition-all"
                placeholder="Enter node identifier"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-2">
                Authentication Key
              </label>
              <div className="relative">
                <input
                  id="key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500 focus:ring-2 focus:ring-sapphire-500/20 transition-all"
                  placeholder="Enter authentication key"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden bg-gradient-to-r from-sapphire-600 to-blue-600 hover:from-sapphire-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sapphire-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Sign In'
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Demo Credentials</p>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                <code className="text-xs text-gray-400">NODE001 / SECURE_KEY_123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}