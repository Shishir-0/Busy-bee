import type { ExtractedTerms, LandedCostBreakdown } from '../../../../packages/shared/src/contracts.js';
/**
 * Deterministic calculation of total landed cost.
 * Adheres strictly to:
 * 1. "Unknown shipping costs must NOT be assumed to be zero."
 * 2. "An incomplete offer must remain incomplete."
 * 3. Exact rupee arithmetic for the hackathon reference cases.
 */
export declare function calculateLandedCost(terms: ExtractedTerms, mandateQuantity: number): LandedCostBreakdown;
//# sourceMappingURL=costEngine.d.ts.map