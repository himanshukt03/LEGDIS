import { Shield, Lock, FileCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-charcoal-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-sapphire-500" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-white">LEDGIS</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-sapphire-900/30 border border-sapphire-700/50 rounded-2xl flex items-center justify-center">
                <Shield className="w-12 h-12 text-sapphire-500" strokeWidth={1.5} />
              </div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Blockchain-Powered Law Enforcement Records
            </h2>

            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              LEDGIS provides a secure, immutable, and transparent platform for managing law enforcement evidence files with blockchain technology.
            </p>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-8 py-4 bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-sapphire-900/30 border border-sapphire-700/50 rounded-lg flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-sapphire-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced encryption and blockchain technology ensure that all evidence files are protected from tampering and unauthorized access.
              </p>
            </div>

            <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-sapphire-900/30 border border-sapphire-700/50 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-sapphire-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Immutable</h3>
              <p className="text-gray-400 leading-relaxed">
                Once uploaded to the blockchain, evidence records cannot be altered or deleted, maintaining a permanent chain of custody.
              </p>
            </div>

            <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-sapphire-900/30 border border-sapphire-700/50 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-sapphire-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Transparent</h3>
              <p className="text-gray-400 leading-relaxed">
                Complete audit trails and blockchain verification provide full transparency for all stakeholders in the justice system.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-charcoal-800/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 space-y-4 md:space-y-0">
            <p>© 2024 LEDGIS. All rights reserved.</p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Powered by Blockchain Technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}