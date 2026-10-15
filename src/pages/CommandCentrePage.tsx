import React from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency, formatTime } from '../utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  BookOpen,
  GitCompare,
  Award,
  ArrowRight,
  PlusCircle,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ActiveTab } from '../components/common/Navigation';

interface CommandCentrePageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const CommandCentrePage: React.FC<CommandCentrePageProps> = ({ onNavigate }) => {
  const { activeMandate, sessions, offers, evidence, violations, recommendation } = useNegotiation();

  if (!activeMandate) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink-primary">No Active Mandate Found</h2>
        <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
          Create your first procurement mandate to set hard budget guardrails and begin browser voice negotiations.
        </p>
        <button
          onClick={() => onNavigate('new-mandate')}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Mandate</span>
        </button>
      </div>
    );
  }

  const activeSession = sessions.find((s) => s.status === 'active') || sessions[0];
  const recentEvidence = evidence.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner: Mandate Status & Mission Header */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-procure-700 uppercase tracking-wider">
              Procurement Command Centre
            </span>
            <StatusBadge status={activeMandate.status} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            {activeMandate.title}
          </h1>
          <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
            {activeMandate.objective}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('session')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span>Open Live Voice Session</span>
          </button>
          <button
            onClick={() => onNavigate('new-mandate')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium border border-slate-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Mandate</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Operational Metrics (Authentic & Traceable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget Ceiling */}
        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Budget Ceiling (Hard Cap)</span>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-mono font-bold text-ink-primary">
            {formatCurrency(activeMandate.maxBudget, activeMandate.currency)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Enforced by Negotiation Guard</span>
          </div>
        </div>

        {/* Metric 2: Volume & Delivery Target */}
        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Required Volume & SLA</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-mono font-bold text-ink-primary">
            {activeMandate.quantity} Units • ≤ {activeMandate.deliveryDeadlineDays} Days
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Min Warranty: {activeMandate.minWarrantyMonths} Months
          </div>
        </div>

        {/* Metric 3: Verified Evidence Count */}
        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Captured Evidence Items</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-mono font-bold text-ink-primary">
            {evidence.length} Spoken Terms
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Traceable to Audio Turns</span>
          </div>
        </div>

        {/* Metric 4: Guardrail Violations Blocked */}
        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Policy Rejections</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-700">
            {violations.length} Blocked Actions
          </div>
          <div className="text-[11px] text-rose-700 font-medium">
            {violations.length > 0 ? 'Over-budget / invalid offers stopped' : 'No violations recorded'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Offer Comparison Preview & Evidence Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Offers Summary */}
          <div className="bg-white rounded-xl border border-canvas-border shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-canvas-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Active Merchant Offers ({offers.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('offers')}
                className="text-xs font-medium text-procure-700 hover:text-procure-900 inline-flex items-center gap-1"
              >
                <span>Full Comparison</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {offers.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-muted space-y-1">
                  <div className="font-medium text-ink-primary">No Merchant Offers Recorded Yet</div>
                  <p className="text-[11px]">Start a negotiation session to receive, extract, and compare merchant offers.</p>
                </div>
              ) : (
                offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-ink-primary text-sm flex items-center gap-2">
                        <span>{offer.merchantName}</span>
                        <StatusBadge status={offer.status} />
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {offer.terms.unitPrice ? `${formatCurrency(offer.terms.unitPrice)}/unit • ` : ''}
                        {offer.terms.deliveryDays ? `${offer.terms.deliveryDays}d delivery • ` : ''}
                        {offer.terms.warrantyMonths ? `${offer.terms.warrantyMonths}m warranty` : ''}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-mono font-bold text-ink-primary">
                        {offer.terms.totalLandedCost !== null
                          ? formatCurrency(offer.terms.totalLandedCost)
                          : 'Landed Cost Incomplete'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {offer.terms.shippingCost !== null
                          ? `Freight: ${formatCurrency(offer.terms.shippingCost)}`
                          : 'Shipping: Unknown'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Evidence Ledger Stream Snippet */}
          <div className="bg-white rounded-xl border border-canvas-border shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-canvas-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Recent Evidence Ledger Turns
                </h3>
              </div>
              <button
                onClick={() => onNavigate('evidence')}
                className="text-xs font-medium text-procure-700 hover:text-procure-900 inline-flex items-center gap-1"
              >
                <span>All Evidence Records</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {recentEvidence.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-muted space-y-1">
                  <div className="font-medium text-ink-primary">No Evidence Recorded Yet</div>
                  <p className="text-[11px]">Verbatim spoken quotes and extracted terms will stream here during sessions.</p>
                </div>
              ) : (
                recentEvidence.map((ev) => (
                  <div key={ev.id} className="p-4 space-y-1.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-primary">{ev.extractedField}:</span>
                        <span className="font-mono font-bold text-emerald-800">{ev.extractedValue}</span>
                      </div>
                      <StatusBadge status={ev.verificationStatus} />
                    </div>
                    <p className="font-mono text-[11px] text-ink-muted bg-slate-50 p-2 rounded border border-slate-200/80">
                      "{ev.transcriptExcerpt}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Speaker: {ev.speakerLabel}</span>
                      <span className="font-mono">Turn: {ev.sourceTurnId} • {formatTime(ev.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendation & Session Status */}
        <div className="space-y-6">
          {/* Decision Summary Card */}
          {recommendation ? (
            <div className="bg-white rounded-xl border border-emerald-300 shadow-xs p-5 space-y-3 ring-1 ring-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Deal Recommendation
                </span>
                <StatusBadge status={recommendation.status} />
              </div>

              <div>
                <h4 className="font-bold text-base text-ink-primary">
                  {recommendation.recommendedMerchant || 'Awaiting Offer Shortlist'}
                </h4>
                <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(recommendation.totalLandedCost)}
                </div>
                <div className="text-xs text-emerald-800 font-medium mt-0.5">
                  Surplus under cap: {formatCurrency(recommendation.budgetRemaining)}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="text-[11px] font-semibold text-ink-primary">Winning Highlights:</div>
                <p className="text-[11px] leading-relaxed line-clamp-3">
                  {recommendation.reasons[0]}
                </p>
              </div>

              <button
                onClick={() => onNavigate('recommendation')}
                className="w-full mt-2 py-2 px-3 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Calculation & Approve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-5 space-y-2 text-center text-xs text-ink-muted">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-semibold text-ink-primary text-xs">No Recommendation Generated</div>
              <p className="text-[11px] leading-relaxed">
                The Deal Decision Engine ranks offers and generates verifiable recommendations once sessions conclude.
              </p>
            </div>
          )}

          {/* Active Session Status Card */}
          <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Active Session
              </span>
              <StatusBadge status={activeSession?.status || 'ended'} />
            </div>

            {activeSession ? (
              <div className="space-y-2 text-xs">
                <div>
                  <div className="font-semibold text-ink-primary">{activeSession.merchantName}</div>
                  <div className="text-[11px] text-ink-muted">{activeSession.merchantRepName}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Room ID: {activeSession.roomId}</div>
                  <div>AI Disclosure: {activeSession.agentDisclosureCompleted ? 'Completed' : 'Pending'}</div>
                  <div>Recording Consent: {activeSession.recordingConsentObtained ? 'Granted' : 'Pending'}</div>
                </div>

                <button
                  onClick={() => onNavigate('session')}
                  className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Join Session Interface</span>
                </button>
              </div>
            ) : (
              <div className="py-4 text-center space-y-3">
                <p className="text-xs text-ink-muted">No active negotiation session in progress.</p>
                <button
                  onClick={() => onNavigate('session')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Start New Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
