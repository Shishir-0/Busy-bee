import React, { useState } from 'react';
import { NegotiationProvider } from './context/NegotiationContext';
import { Navigation, ActiveTab } from './components/common/Navigation';
import { CommandCentrePage } from './pages/CommandCentrePage';
import { MandateSetupPage } from './pages/MandateSetupPage';
import { ActiveSessionPage } from './pages/ActiveSessionPage';
import { EvidenceLedgerPage } from './pages/EvidenceLedgerPage';
import { OfferComparisonPage } from './pages/OfferComparisonPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { MerchantBrowserPage } from './pages/MerchantBrowserPage';
import { ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('command-centre');

  return (
    <div className="min-h-screen flex flex-col bg-canvas-bg text-ink-primary font-sans">
      {/* Top Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'command-centre' && (
          <CommandCentrePage onNavigate={setCurrentTab} />
        )}
        {currentTab === 'new-mandate' && (
          <MandateSetupPage onCreated={setCurrentTab} />
        )}
        {currentTab === 'session' && (
          <ActiveSessionPage onNavigate={setCurrentTab} />
        )}
        {currentTab === 'evidence' && <EvidenceLedgerPage />}
        {currentTab === 'offers' && (
          <OfferComparisonPage onNavigate={setCurrentTab} />
        )}
        {currentTab === 'recommendation' && (
          <RecommendationPage onNavigate={setCurrentTab} />
        )}
        {currentTab === 'merchant' && <MerchantBrowserPage />}
      </main>

      {/* Operational Footer */}
      <footer className="bg-white border-t border-canvas-border py-4 px-4 sm:px-6 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-ink-primary">The Negotiator</span>
            <span>• Proof-First Procurement AI</span>
            <span className="hidden md:inline">• CHAOS Hackathon (Team: Busy-bee)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Spend Guard: ₹0 New Spend Compliance</span>
            <span>•</span>
            <span>WebRTC Audio Simulation Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NegotiationProvider>
      <AppContent />
    </NegotiationProvider>
  );
};

export default App;
