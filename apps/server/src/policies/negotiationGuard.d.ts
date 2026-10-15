import type { ExtractedTerms, NegotiationMandate, PolicyEvaluationResult, MerchantSession } from '../../../../packages/shared/src/contracts.js';
export interface EvaluatePolicyOptions {
    mandate: NegotiationMandate;
    session: MerchantSession;
    proposedTerms: ExtractedTerms;
    actionType: 'propose_offer' | 'counter_offer' | 'accept_terms' | 'confirm_merchant_offer';
}
/**
 * Deterministic Negotiation Guard Policy Engine.
 * Evaluates whether a proposed agent action or merchant offer conforms to the buyer's mandate.
 * The LLM may suggest an action, but only this code can authorize it.
 */
export declare function evaluateNegotiationPolicy({ mandate, session, proposedTerms, actionType, }: EvaluatePolicyOptions): PolicyEvaluationResult;
//# sourceMappingURL=negotiationGuard.d.ts.map