import { Shield, Lock, FileCheck, ArrowRight, CheckCircle2, Zap, Database } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-sapphire-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))]"></div>

      <header className="relative border-b border-white/5 backdrop-blur-xl bg-charcoal-900/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-sapphire-500/20 blur-xl rounded-full"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-sapphire-500 to-sapphire-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                LEDGIS
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-sapphire-500/10 border border-sapphire-500/20 rounded-full mb-8">
              <Zap className="w-4 h-4 text-sapphire-400" />
              <span className="text-sm text-sapphire-300 font-medium">Enterprise Blockchain Security</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Law Enforcement
              <br />
              <span className="bg-gradient-to-r from-sapphire-400 to-blue-400 bg-clip-text text-transparent">
                Records. Secured.
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Immutable blockchain technology ensuring complete transparency and security for critical evidence management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-all duration-200 text-base font-semibold shadow-lg shadow-sapphire-500/25 hover:shadow-sapphire-500/40 hover:scale-105 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all duration-200 text-base font-semibold">
                View Documentation
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-3xl font-bold text-white mb-1">10k+</div>
                <div className="text-sm text-gray-500">Records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">256-bit</div>
                <div className="text-sm text-gray-500">Encryption</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-br from-charcoal-900/90 to-charcoal-900/50 border border-white/10 rounded-2xl p-8 hover:border-sapphire-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sapphire-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-sapphire-500/10 border border-sapphire-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-sapphire-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">End-to-End Encryption</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Military-grade encryption protects all evidence files from unauthorized access and tampering.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    AES-256 encryption
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    Zero-knowledge architecture
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-charcoal-900/90 to-charcoal-900/50 border border-white/10 rounded-2xl p-8 hover:border-sapphire-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sapphire-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-sapphire-500/10 border border-sapphire-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-sapphire-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Immutable Ledger</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Blockchain technology ensures evidence records cannot be altered, maintaining perfect chain of custody.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    Permanent audit trail
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    Tamper-proof storage
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-charcoal-900/90 to-charcoal-900/50 border border-white/10 rounded-2xl p-8 hover:border-sapphire-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sapphire-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-sapphire-500/10 border border-sapphire-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-sapphire-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Complete Transparency</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Full visibility and verification for all stakeholders with comprehensive audit capabilities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    Real-time verification
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-sapphire-500" />
                    Detailed activity logs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <div className="relative bg-gradient-to-br from-sapphire-600/10 to-blue-600/10 border border-sapphire-500/20 rounded-3xl p-12 lg:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.3),rgba(255,255,255,0))]"></div>
            <div className="relative text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to secure your evidence?
              </h2>
              <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                Join law enforcement agencies using blockchain technology to protect critical evidence.
              </p>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white hover:bg-gray-100 text-charcoal-900 rounded-lg transition-all duration-200 text-base font-semibold hover:scale-105"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
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