import { calculateLandedCost } from './costEngine.js';
/**
 * Deterministic Negotiation Guard Policy Engine.
 * Evaluates whether a proposed agent action or merchant offer conforms to the buyer's mandate.
 * The LLM may suggest an action, but only this code can authorize it.
 */
export function evaluateNegotiationPolicy({ mandate, session, proposedTerms, actionType, }) {
    const violations = [];
    const permittedNextActions = ['propose_offer', 'counter_offer'];
    // 1. Session Active Check
    if (session.status !== 'active') {
        return {
            decision: 'session_not_active',
            isAllowed: false,
            denialCode: 'SESSION_NOT_ACTIVE',
            reason: `Session is ${session.status}. Mutations are rejected on inactive sessions.`,
            violations: [`Session state is ${session.status}`],
            isCostProvisional: true,
            permittedNextActions: [],
        };
    }
    // 2. Landed Cost Calculation
    const cost = calculateLandedCost(proposedTerms, mandate.quantity);
    // 3. Budget Check
    if (cost.totalLandedCost > mandate.maxBudget) {
        violations.push(`Total landed cost ₹${cost.totalLandedCost.toLocaleString('en-IN')} exceeds authorized maximum budget of ₹${mandate.maxBudget.toLocaleString('en-IN')}`);
    }
    // If shipping is unknown, we cannot certify total budget compliance
    if (!cost.isShippingKnown && actionType === 'accept_terms') {
        violations.push('Shipping cost is unknown. Deals cannot be confirmed without explicit shipping terms.');
    }
    // 4. Quantity Check
    if (proposedTerms.quantity !== undefined && proposedTerms.quantity !== null) {
        if (proposedTerms.quantity < mandate.quantity) {
            violations.push(`Offered quantity (${proposedTerms.quantity}) is less than required mandate quantity (${mandate.quantity})`);
        }
    }
    // 5. Delivery Deadline Check
    if (proposedTerms.deliveryDays !== undefined && proposedTerms.deliveryDays !== null) {
        if (proposedTerms.deliveryDays > mandate.deliveryDeadlineDays) {
            violations.push(`Delivery timeline (${proposedTerms.deliveryDays} days) exceeds maximum deadline (${mandate.deliveryDeadlineDays} days)`);
        }
    }
    // 6. Minimum Warranty Check
    if (proposedTerms.warrantyMonths !== undefined && proposedTerms.warrantyMonths !== null) {
        if (proposedTerms.warrantyMonths < mandate.minWarrantyMonths) {
            violations.push(`Offered warranty (${proposedTerms.warrantyMonths} months) is less than required minimum warranty (${mandate.minWarrantyMonths} months)`);
        }
    }
    // 7. Mandatory Specifications Check
    if (mandate.mandatorySpecifications && mandate.mandatorySpecifications.length > 0) {
        if (proposedTerms.specifications) {
            const offeredLower = proposedTerms.specifications.map((s) => s.toLowerCase());
            for (const requiredSpec of mandate.mandatorySpecifications) {
                const hasSpec = offeredLower.some((offered) => offered.includes(requiredSpec.toLowerCase()));
                if (!hasSpec) {
                    violations.push(`Mandatory specification not satisfied: "${requiredSpec}"`);
                }
            }
        }
    }
    // 8. Final Decision Logic
    if (violations.length > 0) {
        return {
            decision: 'denied',
            isAllowed: false,
            denialCode: 'POLICY_VIOLATION',
            reason: `Negotiation policy violation: ${violations.join('; ')}`,
            violations,
            calculatedTotalCost: cost.totalLandedCost,
            isCostProvisional: !cost.isComplete,
            permittedNextActions: ['counter_offer', 'clarify_terms'],
        };
    }
    // If incomplete terms but no outright violation
    if (!cost.isComplete) {
        return {
            decision: 'needs_clarification',
            isAllowed: false,
            denialCode: 'INCOMPLETE_TERMS',
            reason: `Terms are incomplete: missing ${cost.missingComponents.join(', ')}`,
            violations: [],
            calculatedTotalCost: cost.totalLandedCost,
            isCostProvisional: true,
            permittedNextActions: ['clarify_shipping', 'clarify_terms', 'counter_offer'],
        };
    }
    // Action permitted
    if (actionType === 'accept_terms' || actionType === 'confirm_merchant_offer') {
        permittedNextActions.push('ready_for_buyer_review');
    }
    return {
        decision: 'allowed',
        isAllowed: true,
        reason: 'All proposed terms satisfy buyer mandate and business rules.',
        violations: [],
        calculatedTotalCost: cost.totalLandedCost,
        isCostProvisional: false,
        permittedNextActions,
    };
}
//# sourceMappingURL=negotiationGuard.js.map