import { calculateLandedCost } from './costEngine.js';
export function evaluateRecommendation(mandate, offers, evidenceList) {
    const eligibleOffers = [];
    const ineligibleOffers = [];
    const unresolvedConditions = [];
    for (const offer of offers) {
        const cost = calculateLandedCost(offer.terms, mandate.quantity);
        const exclusions = [];
        // 1. Completeness Check
        if (!cost.isComplete) {
            exclusions.push(`Cost is incomplete: missing ${cost.missingComponents.join(', ')}`);
        }
        // 2. Budget Check
        if (cost.totalLandedCost > mandate.maxBudget) {
            exclusions.push(`Total landed cost (₹${cost.totalLandedCost.toLocaleString('en-IN')}) exceeds budget ceiling of ₹${mandate.maxBudget.toLocaleString('en-IN')}`);
        }
        // 3. Quantity Check
        const effectiveQty = offer.terms.quantity ?? mandate.quantity;
        if (effectiveQty < mandate.quantity) {
            exclusions.push(`Offered quantity (${effectiveQty}) is below required (${mandate.quantity})`);
        }
        // 4. Delivery Deadline Check
        if (offer.terms.deliveryDays !== undefined && offer.terms.deliveryDays !== null) {
            if (offer.terms.deliveryDays > mandate.deliveryDeadlineDays) {
                exclusions.push(`Delivery timeline (${offer.terms.deliveryDays} days) exceeds maximum deadline (${mandate.deliveryDeadlineDays} days)`);
            }
        }
        // 5. Warranty Check
        if (offer.terms.warrantyMonths !== undefined && offer.terms.warrantyMonths !== null) {
            if (offer.terms.warrantyMonths < mandate.minWarrantyMonths) {
                exclusions.push(`Warranty (${offer.terms.warrantyMonths} months) is below required minimum (${mandate.minWarrantyMonths} months)`);
            }
        }
        // 6. Mandatory Specifications Check
        if (mandate.mandatorySpecifications && mandate.mandatorySpecifications.length > 0) {
            if (offer.terms.specifications) {
                const specsLower = offer.terms.specifications.map((s) => s.toLowerCase());
                for (const reqSpec of mandate.mandatorySpecifications) {
                    const matched = specsLower.some((s) => s.includes(reqSpec.toLowerCase()));
                    if (!matched) {
                        exclusions.push(`Missing mandatory specification: "${reqSpec}"`);
                    }
                }
            }
        }
        // Count verified evidence items linked to this offer
        const verifiedEvidenceCount = evidenceList.filter((ev) => ev.sessionId === offer.sessionId && ev.verificationStatus === 'verified').length;
        const evaluation = {
            offerId: offer.id,
            merchantName: offer.merchantName,
            isEligible: exclusions.length === 0,
            exclusionReasons: exclusions,
            costBreakdown: cost,
            terms: offer.terms,
            verifiedEvidenceCount,
        };
        if (evaluation.isEligible) {
            eligibleOffers.push(evaluation);
        }
        else {
            ineligibleOffers.push(evaluation);
        }
    }
    // Rank eligible offers by lowest total landed cost, then tie-breakers (shorter delivery, longer warranty)
    eligibleOffers.sort((a, b) => {
        if (a.costBreakdown.totalLandedCost !== b.costBreakdown.totalLandedCost) {
            return a.costBreakdown.totalLandedCost - b.costBreakdown.totalLandedCost;
        }
        // Tie-breaker 1: Shorter delivery timeline
        const deliveryA = a.terms.deliveryDays ?? 999;
        const deliveryB = b.terms.deliveryDays ?? 999;
        if (deliveryA !== deliveryB) {
            return deliveryA - deliveryB;
        }
        // Tie-breaker 2: Longer warranty
        const warrantyA = a.terms.warrantyMonths ?? 0;
        const warrantyB = b.terms.warrantyMonths ?? 0;
        return warrantyB - warrantyA;
    });
    const hasWinner = eligibleOffers.length > 0;
    const winner = hasWinner ? eligibleOffers[0] : null;
    let status = 'not_ready';
    if (hasWinner) {
        status = 'ready_for_review';
    }
    else if (offers.length > 0) {
        status = 'provisional';
        unresolvedConditions.push('No eligible offers currently meet all mandatory constraints.');
    }
    else {
        unresolvedConditions.push('No merchant offers have been received yet.');
    }
    const formulaExplanation = 'Total Landed Cost = (Unit Price × Quantity) + Shipping Fee + Additional Fees + Excluded Taxes. Ranking sorts strictly by lowest verified landed cost satisfying all mandatory buyer criteria.';
    return {
        id: `rec-${mandate.id}`,
        negotiationId: mandate.id,
        status,
        winnerOfferId: winner ? winner.offerId : null,
        winnerMerchantName: winner ? winner.merchantName : null,
        eligibleOffers,
        ineligibleOffers,
        unresolvedConditions,
        formulaExplanation,
        calculatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=recommendationEngine.js.map