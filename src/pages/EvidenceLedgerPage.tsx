import React from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { EvidenceTimeline } from '../components/evidence/EvidenceTimeline';
import { BookOpen, ShieldCheck } from 'lucide-react';

export const EvidenceLedgerPage: React.FC = () => {
  const { evidence } = useNegotiation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-procure-700 uppercase tracking-wider">
              Signature Audit Feature
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            Live Evidence Ledger
          </h1>
          <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
            Every material commercial term links directly to its verbatim spoken audio transcript, speaker timestamp, and verification status. An offer without verified evidence cannot be authoritatively accepted.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Provenance Standard: RFC-Evidence-01</span>
        </div>
      </div>

      {/* Main Evidence Timeline Component */}
      <EvidenceTimeline items={evidence} />
    </div>
  );
};
