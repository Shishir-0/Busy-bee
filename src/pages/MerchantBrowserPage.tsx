import React, { useState } from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import {
  Store,
  Mic,
  MicOff,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Volume2,
  Send,
} from 'lucide-react';

export const MerchantBrowserPage: React.FC = () => {
  const { activeSession, simulateNewTurn } = useNegotiation();

  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [spokenInput, setSpokenInput] = useState<string>('');

  const merchantName = activeSession?.merchantName || 'Sterling Commercial Furniture';

  const handleSendSpokenTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokenInput.trim()) return;

    simulateNewTurn('merchant', spokenInput.trim(), {
      key: 'price',
      field: 'Spoken Commercial Term',
      value: spokenInput.trim(),
      status: 'verified',
    });
    setSpokenInput('');
  };

  const handleApplyPreset = (quoteText: string, field: string, val: string) => {
    simulateNewTurn('merchant', quoteText, {
      key: 'price',
      field,
      value: val,
      status: 'verified',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Merchant Top Header */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
              Merchant Participant Portal (Browser Simulation)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            {merchantName}
          </h1>
          <p className="text-xs text-ink-muted">
            Role: Authorized Vendor Sales Representative • WebRTC Audio Channel Live
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMicActive(!isMicActive)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold shadow-xs transition-colors ${
              isMicActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isMicActive ? 'Microphone Active' : 'Microphone Muted'}</span>
          </button>
        </div>
      </div>

      {/* Recording & AI Disclosure Consent Banner */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-semibold text-white">AI Disclosure & Audio Capture Agreement</div>
            <p className="text-[11px] text-slate-400">
              You are participating in a simulated browser WebRTC negotiation with an AI procurement buyer. Your spoken words are transcribed for commercial verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> CONSENT VERIFIED
          </span>
        </div>
      </div>

      {/* Merchant Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Spoken Input & Preset Response Sheet */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-slate-500" />
              Speak or Submit Spoken Vendor Quotation
            </h2>

            {/* Quick Preset Buttons for Demo Ease */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-ink-muted uppercase">
                Quick Quotation Presets (1-Click Spoken Turn)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'For 50 units, our best price is ₹2,800 per chair with ₹2,500 shipping and 18 months warranty.',
                      'Full Commercial Offer',
                      '₹2,800/unit, ₹2,500 shipping, 18m warranty'
                    )
                  }
                  className="p-3 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg space-y-1 transition-colors"
                >
                  <div className="font-semibold text-emerald-800">Competitive Winning Offer</div>
                  <p className="text-[11px] text-ink-muted">
                    ₹2,800/chair • ₹2,500 freight • 18m warranty (Dispatches in 3 days)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'I can only do ₹3,200 per chair with ₹5,000 delivery.',
                      'High Quote (Breach Test)',
                      '₹3,200/unit, ₹5,000 shipping'
                    )
                  }
                  className="p-3 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg space-y-1 transition-colors"
                >
                  <div className="font-semibold text-rose-800">Over-Budget Quote (Guard Test)</div>
                  <p className="text-[11px] text-ink-muted">
                    ₹3,200/chair • Breaches buyer hard budget ceiling
                  </p>
                </button>
              </div>
            </div>

            {/* Custom Spoken Response Form */}
            <form onSubmit={handleSendSpokenTurn} className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-medium text-ink-primary">
                Custom Spoken Response
              </label>
              <textarea
                value={spokenInput}
                onChange={(e) => setSpokenInput(e.target.value)}
                placeholder="Type verbatim statement as spoken over the microphone..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!spokenInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Spoken Turn</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Vendor Rate Card & Instructions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-5 space-y-3 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-slate-700 text-[11px] flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Vendor Rate Sheet (Internal)
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-ink-muted">Standard Catalogue:</span>
                <span className="font-mono font-medium">₹3,400 / unit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-ink-muted">Min Floor Rate:</span>
                <span className="font-mono font-medium text-emerald-700">₹2,750 / unit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-ink-muted">Bangalore Freight:</span>
                <span className="font-mono font-medium">₹2,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-ink-muted">Standard Warranty:</span>
                <span className="font-mono font-medium">12 Months</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-950 space-y-1">
              <div className="font-semibold">Participant Role Guidance:</div>
              <p className="leading-relaxed">
                As the merchant, you can offer discounts, adjust delivery speed, or hold firm. The buyer AI will counteroffer strictly within its authorized constraints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
