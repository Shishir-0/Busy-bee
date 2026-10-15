import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, XCircle, Info, Lock } from 'lucide-react';
import { NegotiationMandate, PolicyViolation, CommercialTerms } from '../../types/negotiation';
import { formatCurrency } from '../../utils/formatters';

interface NegotiationGuardPanelProps {
  mandate: NegotiationMandate;
  currentTerms?: CommercialTerms | null;
  violations: PolicyViolation[];
}

export const NegotiationGuardPanel: React.FC<NegotiationGuardPanelProps> = ({
  mandate,
  currentTerms,
  violations,
}) => {
  const currentCost = currentTerms?.totalLandedCost ?? currentTerms?.subtotal ?? 0;
  const budgetUtilization = Math.min(Math.round((currentCost / mandate.maxBudget) * 100), 120);
  const isOverBudget = currentCost > mandate.maxBudget;

  return (
    <div className="bg-white rounded-lg border border-canvas-border shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Negotiation Guard
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic Backend Policy Enforcement
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          GUARD ACTIVE
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Budget Enforcement Meter */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-ink-secondary">Authorized Budget Ceiling</span>
            <span className="font-mono font-semibold text-ink-primary">
              {formatCurrency(mandate.maxBudget, mandate.currency)}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-600'
                  : budgetUtilization > 90
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-muted mt-1">
            <span>
              Proposed:{' '}
              <strong className="text-ink-primary font-mono">
                {currentCost > 0 ? formatCurrency(currentCost, mandate.currency) : 'Pending quote'}
              </strong>
            </span>
            <span className={isOverBudget ? 'text-rose-700 font-semibold' : 'text-emerald-700'}>
              {isOverBudget ? `BREACH: +${formatCurrency(currentCost - mandate.maxBudget, mandate.currency)}` : `${budgetUtilization}% Allocated`}
            </span>
          </div>
        </div>

        {/* Hard Mandatory Rules Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Delivery Deadline</div>
            <div className="font-mono font-bold text-ink-primary mt-0.5">
              ≤ {mandate.deliveryDeadlineDays} Days
            </div>
            <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-1">
              {currentTerms?.deliveryDays ? (
                currentTerms.deliveryDays <= mandate.deliveryDeadlineDays ? (
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Met ({currentTerms.deliveryDays}d)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-0.5">
                    <XCircle className="w-3 h-3" /> Exceeded ({currentTerms.deliveryDays}d)
                  </span>
                )
              ) : (
                <span className="text-slate-400">Awaiting quote</span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Min. Warranty</div>
            <div className="font-mono font-bold text-ink-primary mt-0.5">
              ≥ {mandate.minWarrantyMonths} Months
            </div>
            <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-1">
              {currentTerms?.warrantyMonths ? (
                currentTerms.warrantyMonths >= mandate.minWarrantyMonths ? (
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Met ({currentTerms.warrantyMonths}m)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-0.5">
                    <XCircle className="w-3 h-3" /> Sub-par ({currentTerms.warrantyMonths}m)
                  </span>
                )
              ) : (
                <span className="text-slate-400">Awaiting quote</span>
              )}
            </div>
          </div>
        </div>

        {/* Mandatory Specifications */}
        <div>
          <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Mandatory Specs (Non-Negotiable)
          </h4>
          <ul className="space-y-1 text-xs text-ink-secondary">
            {mandate.mandatorySpecs.map((spec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                <span className="text-[11px]">{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy Violations / Blocked Actions Log */}
        {violations.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Policy Rejections ({violations.length})</span>
            </div>
            <div className="space-y-2">
              {violations.map((vio) => (
                <div
                  key={vio.id}
                  className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-[11px]">
                    <span className="flex items-center gap-1 text-rose-900">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
                      {vio.ruleName}
                    </span>
                    <span className="text-[10px] font-mono text-rose-700 uppercase">
                      BLOCKED BY GUARD
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800">{vio.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
