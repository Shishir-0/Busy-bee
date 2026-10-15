import React from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { DecisionEngineBreakdown } from '../components/recommendation/DecisionEngineBreakdown';
import { Award, ShieldCheck, Layers } from 'lucide-react';
import { ActiveTab } from '../components/common/Navigation';

interface RecommendationPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({ onNavigate }) => {
  const { recommendation, activeMandate, approveRecommendation } = useNegotiation();

  if (!activeMandate) {
    return (
      <div className="text-center py-12 text-xs text-ink-muted">
        No active negotiation mandate. Please select or create one first.
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-12 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-ink-primary">No Recommendation Generated Yet</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Negotiation sessions must conclude with verified merchant quotes before the Deal Decision Engine can compute a deterministic ranking.
        </p>
        <button
          onClick={() => onNavigate('session')}
          className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800"
        >
          Return to Active Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-procure-700 uppercase tracking-wider">
              Autonomous Deal Decision Engine
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            Explainable Procurement Recommendation
          </h1>
          <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
            The Deal Decision Engine verifies all mandatory constraints, calculates transparent landed costs, and details the deterministic rationale behind the shortlisted offer.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Decision Reproducibility: 100% Deterministic</span>
        </div>
      </div>

      {/* Main Breakdown Component */}
      <DecisionEngineBreakdown
        recommendation={recommendation}
        mandate={activeMandate}
        onApprove={approveRecommendation}
        onInspectEvidence={() => onNavigate('evidence')}
      />
    </div>
  );
};
