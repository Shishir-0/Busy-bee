import React from 'react';
import { CommercialTerms } from '../../types/negotiation';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { HelpCircle, AlertCircle } from 'lucide-react';

interface ExtractedTermsSummaryProps {
  terms: CommercialTerms;
  status: string;
  merchantName: string;
}

export const ExtractedTermsSummary: React.FC<ExtractedTermsSummaryProps> = ({
  terms,
  status,
  merchantName,
}) => {
  const isShippingKnown = terms.shippingCost !== null;
  const isLandedCostKnown = terms.totalLandedCost !== null;

  return (
    <div className="bg-white rounded-lg border border-canvas-border shadow-xs overflow-hidden">
      <div className="bg-slate-50 border-b border-canvas-border px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            Current Offer Terms Summary
          </h3>
          <p className="text-[11px] text-ink-muted">Participant: {merchantName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Unit Price */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-ink-muted">Unit Price</div>
            <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
              {formatCurrency(terms.unitPrice)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Per confirmed chair</div>
          </div>

          {/* Quantity */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-ink-muted">Volume</div>
            <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
              {terms.quantity} Units
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Subtotal: {formatCurrency(terms.subtotal)}</div>
          </div>

          {/* Shipping */}
          <div
            className={`p-2.5 rounded-md border ${
              isShippingKnown
                ? 'bg-slate-50 border-slate-200'
                : 'bg-amber-50/70 border-amber-300 text-amber-900'
            }`}
          >
            <div className="text-[10px] uppercase font-semibold text-ink-muted flex items-center gap-1">
              <span>Freight / Shipping</span>
              {!isShippingKnown && <AlertCircle className="w-3 h-3 text-amber-700" />}
            </div>
            <div className="text-sm font-mono font-bold mt-0.5">
              {isShippingKnown ? formatCurrency(terms.shippingCost) : 'Unknown / Pending'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {isShippingKnown ? 'Doorstep freight confirmed' : 'Requires quotation'}
            </div>
          </div>

          {/* Taxes */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-ink-muted">Taxes & Levies</div>
            <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
              {formatCurrency(terms.taxes)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">GST Output tax</div>
          </div>

          {/* Delivery Days */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-ink-muted">Delivery Schedule</div>
            <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
              {terms.deliveryDays ? `${terms.deliveryDays} Days` : 'Pending'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">From dispatch approval</div>
          </div>

          {/* Warranty */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-ink-muted">Warranty Period</div>
            <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
              {terms.warrantyMonths ? `${terms.warrantyMonths} Months` : 'Pending'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Manufacturer replacement</div>
          </div>
        </div>

        {/* Total Landed Cost Banner */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between ${
            isLandedCostKnown
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wide">
              {isLandedCostKnown ? 'Verified Total Landed Cost' : 'Total Landed Cost: Incomplete'}
            </div>
            <div className="text-base sm:text-lg font-mono font-bold mt-0.5">
              {isLandedCostKnown ? formatCurrency(terms.totalLandedCost) : 'Pending Complete Terms'}
            </div>
          </div>
          <div className="text-right text-xs">
            {isLandedCostKnown ? (
              <span className="text-emerald-800 font-medium">All material terms confirmed</span>
            ) : (
              <span className="text-amber-800 flex items-center gap-1 font-medium">
                <HelpCircle className="w-3.5 h-3.5" /> Missing shipping freight
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
