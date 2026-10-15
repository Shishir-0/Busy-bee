import React, { useState } from 'react';
import { DealRecommendation, NegotiationMandate } from '../../types/negotiation';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Award,
  CheckCircle2,
  XCircle,
  Calculator,
  FileCheck,
  AlertTriangle,
  Send,
  ExternalLink,
} from 'lucide-react';

interface DecisionEngineBreakdownProps {
  recommendation: DealRecommendation;
  mandate: NegotiationMandate;
  onApprove: (reviewer: string, comments: string) => Promise<void>;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const DecisionEngineBreakdown: React.FC<DecisionEngineBreakdownProps> = ({
  recommendation,
  mandate,
  onApprove,
  onInspectEvidence,
}) => {
  const [reviewerName, setReviewerName] = useState<string>('Diya Sharma (Head of Procurement)');
  const [approvalComments, setApprovalComments] = useState<string>(
    'Commercial terms audited against mandate budget and warranty specs. Approved to prepare formal PO.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showApprovalForm, setShowApprovalForm] = useState<boolean>(false);

  const isReviewed = recommendation.status === 'reviewed';

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onApprove(reviewerName, approvalComments);
      setShowApprovalForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Winning Recommendation Card */}
      <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden ring-1 ring-emerald-100">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Deal Decision Engine Recommendation
                </span>
                <StatusBadge status={recommendation.status} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                {recommendation.recommendedMerchant || 'No Eligible Winner'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Evaluated against Mandate: {mandate.title}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Verified Landed Cost
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
              {formatCurrency(recommendation.totalLandedCost, mandate.currency)}
            </div>
            <div className="text-xs text-emerald-300 font-medium mt-0.5">
              ✓ Saves {formatCurrency(recommendation.budgetRemaining, mandate.currency)} under budget cap
            </div>
          </div>
        </div>

        {/* Why this offer won */}
        <div className="p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Primary Reasons for Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recommendation.reasons.map((reason, i) => (
                <div
                  key={i}
                  className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-emerald-950 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Supporting Evidence Citations */}
            {recommendation.supportingEvidenceIds.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-semibold text-ink-muted uppercase">Audited Evidence:</span>
                {recommendation.supportingEvidenceIds.map((evId) => (
                  <button
                    key={evId}
                    type="button"
                    onClick={() => onInspectEvidence && onInspectEvidence(evId)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] shadow-2xs"
                  >
                    <span>{evId}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mathematical Calculation Breakdown Table */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Transparent Landed Cost Calculation
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Formula: {recommendation.calculationBreakdown.formula}
              </span>
            </div>

            <div className="bg-white rounded-md border border-slate-200 overflow-hidden divide-y divide-slate-100 font-mono text-xs">
              {recommendation.calculationBreakdown.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 ${
                    item.label.includes('Total')
                      ? 'bg-emerald-50/80 font-bold text-emerald-950'
                      : item.label.includes('Savings')
                      ? 'bg-blue-50/60 font-semibold text-blue-900'
                      : 'text-ink-secondary'
                  }`}
                >
                  <span className="font-sans text-xs">{item.label}</span>
                  <div className="text-right">
                    <span>{formatCurrency(item.amount, mandate.currency)}</span>
                    {item.notes && (
                      <span className="block font-sans text-[10px] text-slate-500 font-normal">
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disqualified Competitor Summary */}
          {recommendation.excludedOffers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Excluded & Incomplete Alternatives
              </h4>
              <div className="space-y-2">
                {recommendation.excludedOffers.map((exc) => (
                  <div
                    key={exc.offerId}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <strong className="text-rose-900 font-semibold">{exc.merchantName}</strong>
                      <p className="text-[11px] text-rose-800 mt-0.5">{exc.reason}</p>
                    </div>
                    <span className="font-mono text-[10px] text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 self-start sm:self-auto">
                      DISQUALIFIED BY GUARD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unresolved Conditions & Disclaimers */}
          {recommendation.unresolvedConditions.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-950 space-y-1">
              <div className="font-semibold text-xs flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Unresolved Conditions Before Commercial Placement
              </div>
              <ul className="list-disc pl-5 text-[11px] text-amber-900 space-y-0.5">
                {recommendation.unresolvedConditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-800 pt-1">
                * Note: The Negotiator does not execute binding contracts or transfer payments automatically. All commercial orders require human procurement confirmation.
              </p>
            </div>
          )}

          {/* Final Buyer Review / Approval Action */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            {isReviewed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Buyer Procurement Audit Completed & Approved</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded text-xs text-ink-secondary space-y-1">
                  <div className="text-[11px] font-mono text-ink-muted">
                    Reviewed By: <strong className="text-ink-primary">{recommendation.buyerReviewAction?.reviewedBy}</strong> on{' '}
                    {formatDate(recommendation.buyerReviewAction?.approvedAt || '')} at{' '}
                    {formatTime(recommendation.buyerReviewAction?.approvedAt || '')}
                  </div>
                  <div className="text-[11px] text-slate-700 italic">
                    "{recommendation.buyerReviewAction?.comments}"
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {!showApprovalForm ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-xs text-ink-primary">
                        Buyer Review & Audit Sign-Off
                      </h4>
                      <p className="text-[11px] text-ink-muted">
                        Confirm recommendation rationale and record an immutable decision entry.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowApprovalForm(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs shadow-xs transition-colors"
                    >
                      Audit & Approve Recommendation
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApproveSubmit} className="space-y-3">
                    <h4 className="font-semibold text-xs text-ink-primary">
                      Record Buyer Review Decision
                    </h4>
                    <div>
                      <label className="block text-[11px] text-ink-muted mb-1">Reviewer Name</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        required
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-procure-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-ink-muted mb-1">Approval Notes</label>
                      <textarea
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        required
                        rows={2}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-procure-600"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowApprovalForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Recording...' : 'Submit Audit Sign-Off'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
