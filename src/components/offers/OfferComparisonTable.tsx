import React from 'react';
import { MerchantOffer, NegotiationMandate } from '../../types/negotiation';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, XCircle, ArrowRight, GitCompare } from 'lucide-react';

interface OfferComparisonTableProps {
  offers: MerchantOffer[];
  mandate: NegotiationMandate;
  onSelectOffer?: (offerId: string) => void;
}

export const OfferComparisonTable: React.FC<OfferComparisonTableProps> = ({
  offers,
  mandate,
  onSelectOffer,
}) => {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-12 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-ink-primary">No Merchant Offers Recorded Yet</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          As negotiations proceed and vendor quotes are captured, offers will appear here for automated landed-cost arithmetic and policy compliance evaluation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => {
          const isShippingKnown = offer.terms.shippingCost !== null;
          const isLandedCostKnown = offer.terms.totalLandedCost !== null;

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                offer.isEligible
                  ? 'border-emerald-300 ring-1 ring-emerald-100 hover:shadow-md'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              {/* Card Top Banner */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between text-xs ${
                  offer.isEligible ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-ink-primary truncate mr-2">
                  {offer.merchantName}
                </div>
                <StatusBadge status={offer.status} />
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4 flex-1 text-xs">
                {/* Landed Cost Highlight */}
                <div
                  className={`p-3 rounded-lg border text-center ${
                    isLandedCostKnown
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-amber-50 text-amber-950 border-amber-300'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    {isLandedCostKnown ? 'Total Landed Cost' : 'Landed Cost Incomplete'}
                  </div>
                  <div className="text-xl font-mono font-bold mt-0.5">
                    {isLandedCostKnown ? formatCurrency(offer.terms.totalLandedCost) : 'Unknown Shipping'}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-300">
                    {isLandedCostKnown ? (
                      offer.terms.totalLandedCost! <= mandate.maxBudget ? (
                        <span className="text-emerald-400 font-medium">
                          Under budget by {formatCurrency(mandate.maxBudget - offer.terms.totalLandedCost!)}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">
                          Exceeds budget cap by {formatCurrency(offer.terms.totalLandedCost! - mandate.maxBudget)}
                        </span>
                      )
                    ) : (
                      <span className="text-amber-800 font-medium">
                        Missing freight prevents total calculation
                      </span>
                    )}
                  </div>
                </div>

                {/* Arithmetic Breakdown List */}
                <div className="space-y-1.5 pt-1 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Unit Rate (50 Units):</span>
                    <span className="font-mono font-semibold text-ink-primary">
                      {formatCurrency(offer.terms.unitPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Subtotal (Chair Volume):</span>
                    <span className="font-mono font-medium text-ink-primary">
                      {formatCurrency(offer.terms.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Taxes (GST):</span>
                    <span className="font-mono font-medium text-ink-primary">
                      {formatCurrency(offer.terms.taxes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Shipping Freight:</span>
                    <span
                      className={`font-mono font-medium ${
                        isShippingKnown ? 'text-ink-primary' : 'text-amber-700 font-bold'
                      }`}
                    >
                      {isShippingKnown ? formatCurrency(offer.terms.shippingCost) : 'UNKNOWN (Not ₹0)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Delivery Speed:</span>
                    <span
                      className={`font-mono font-medium ${
                        offer.terms.deliveryDays && offer.terms.deliveryDays <= mandate.deliveryDeadlineDays
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {offer.terms.deliveryDays ? `${offer.terms.deliveryDays} Days` : 'Pending'}
                      {offer.terms.deliveryDays && offer.terms.deliveryDays > mandate.deliveryDeadlineDays && ' (Too slow)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">Warranty Period:</span>
                    <span
                      className={`font-mono font-medium ${
                        offer.terms.warrantyMonths && offer.terms.warrantyMonths >= mandate.minWarrantyMonths
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {offer.terms.warrantyMonths ? `${offer.terms.warrantyMonths} Months` : 'Pending'}
                      {offer.terms.warrantyMonths && offer.terms.warrantyMonths < mandate.minWarrantyMonths && ' (Below min)'}
                    </span>
                  </div>
                </div>

                {/* Eligibility Result Box */}
                <div
                  className={`p-2.5 rounded-md border text-xs ${
                    offer.isEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    {offer.isEligible ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{offer.isEligible ? 'Mandate Criteria Satisfied' : 'Offer Disqualified'}</span>
                  </div>
                  {offer.ineligibilityReason && (
                    <p className="mt-1 text-[11px] leading-relaxed text-rose-800">
                      {offer.ineligibilityReason}
                    </p>
                  )}
                </div>

                {/* Evidence Completeness Pill */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
                  <span>Linked Evidence:</span>
                  <span className="font-mono text-ink-primary font-semibold">
                    {offer.evidenceIds.length} Spoken Terms Audited
                  </span>
                </div>
              </div>

              {/* Card Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                {onSelectOffer && (
                  <button
                    onClick={() => onSelectOffer(offer.id)}
                    className="w-full py-1.5 px-3 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Terms & Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
