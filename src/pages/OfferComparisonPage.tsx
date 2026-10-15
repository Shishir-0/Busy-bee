import React from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { OfferComparisonTable } from '../components/offers/OfferComparisonTable';
import { GitCompare, Award, ArrowRight, Info } from 'lucide-react';
import { ActiveTab } from '../components/common/Navigation';

interface OfferComparisonPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const OfferComparisonPage: React.FC<OfferComparisonPageProps> = ({ onNavigate }) => {
  const { offers, activeMandate } = useNegotiation();

  if (!activeMandate) {
    return (
      <div className="text-center py-12 text-xs text-ink-muted">
        No active negotiation mandate. Please select or create one first.
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
              <GitCompare className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-procure-700 uppercase tracking-wider">
              Procurement Intelligence
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            Merchant Offer Comparison
          </h1>
          <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
            Side-by-side evaluation of all captured merchant quotes against the buyer's mandate. Landed cost arithmetic includes verified unit rates, taxes, freight, and fee breakdowns. Missing shipping fees are strictly treated as incomplete, never zero.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recommendation')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Award className="w-4 h-4" />
          <span>View Deal Recommendation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Offer Comparison Grid */}
      <OfferComparisonTable
        offers={offers}
        mandate={activeMandate}
        onSelectOffer={() => onNavigate('evidence')}
      />

      {/* Explanatory Policy Footnote */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-ink-muted flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Procurement Integrity Rule:</strong> The Deal Decision Engine excludes offers that fail mandatory criteria (delivery SLAs, minimum warranties, or hard budget ceilings) regardless of headline discount. Offers with missing freight quotes remain marked as Incomplete until confirmed by the merchant.
        </p>
      </div>
    </div>
  );
};
