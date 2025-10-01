import { Shield, Upload, Search, Layers, LogOut, Menu, X } from 'lucide-react';
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
    { id: 'upload' as PageType, label: 'Upload', icon: Upload },
    { id: 'retrieve' as PageType, label: 'Retrieve', icon: Search },
    { id: 'visualizer' as PageType, label: 'Visualizer', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-charcoal-900/50 border-r border-charcoal-800 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-charcoal-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-sapphire-500" strokeWidth={1.5} />
                <div>
                  <h1 className="text-xl font-bold text-white ">LEDGIS</h1>
                  <p className="text-xs text-gray-500">Blockchain Records</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-charcoal-950 rounded-lg p-3 border border-charcoal-800">
              <p className="text-xs text-gray-500 mb-1">Connected as</p>
              <p className="text-white font-medium text-sm">{currentNode.nodeId}</p>
              <p className="text-gray-400 text-xs mt-1">{currentNode.name}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-sapphire-600 text-white font-semibold '
                      : 'text-gray-400 hover:text-white hover:bg-charcoal-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-charcoal-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-charcoal-900/50 border-b border-charcoal-800 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-charcoal-950 border border-charcoal-800 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">Network Connected</span>
              </div>

              <div className="flex items-center space-x-2 px-4 py-2 bg-sapphire-900/20 border border-sapphire-700/50 rounded-lg">
                <Shield className="w-4 h-4 text-sapphire-500" />
                <span className="text-sapphire-500 text-sm font-medium">Secured</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>

        <footer className="border-t border-charcoal-800 px-6 py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
            <p>LEDGIS Blockchain v1.0 - Secure Law Enforcement Records</p>
            <p className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Immutable. Transparent. Secure.</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}