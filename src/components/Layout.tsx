import { Shield, Upload, Search, Layers, LogOut, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';
import { PageType, Node } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  currentNode: Node;
}

export default function Layout({ children, currentPage, onNavigate, onLogout, currentNode }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'upload' as PageType, label: 'Upload', icon: Upload, description: 'Upload evidence' },
    { id: 'retrieve' as PageType, label: 'Retrieve', icon: Search, description: 'Search records' },
    { id: 'visualizer' as PageType, label: 'Blockchain', icon: Layers, description: 'View ledger' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-sapphire-950 flex">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.1),rgba(255,255,255,0))] pointer-events-none"></div>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-charcoal-900/40 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-sapphire-500/20 blur-lg rounded-full"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-sapphire-500 to-sapphire-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    LEDGIS
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Blockchain System</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sapphire-500/20 to-blue-500/20 border border-sapphire-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-sapphire-400">{currentNode.nodeId.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Connected as</p>
                  <p className="text-sm font-semibold text-white truncate">{currentNode.nodeId}</p>
                  <p className="text-xs text-gray-500 truncate">{currentNode.name}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <span className="text-xs text-gray-600">{new Date(currentNode.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative w-full group"
                >
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sapphire-600 to-blue-600 text-white shadow-lg shadow-sapphire-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-600'}`}>{item.description}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen relative">
        <header className="backdrop-blur-xl bg-charcoal-900/30 border-b border-white/10 px-6 py-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="lg:block hidden"></div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 font-medium">Network Active</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-2 bg-sapphire-500/10 border border-sapphire-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-sapphire-400" />
                <span className="text-xs text-sapphire-300 font-medium">Secured</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 relative">
          {children}
        </main>

        <footer className="border-t border-white/10 backdrop-blur-xl bg-charcoal-900/30 px-6 py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
            <p>LEDGIS v1.0 - Immutable Evidence Ledger</p>
            <div className="flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Powered by Blockchain</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
