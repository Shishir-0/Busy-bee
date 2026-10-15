import { CommercialTerms, NegotiationMandate, MerchantOffer } from '../types/negotiation';

export interface CalculationResult {
  subtotal: number;
  totalLandedCost: number | null;
  isComplete: boolean;
  missingFields: string[];
  formula: string;
}

/**
 * Deterministic total landed cost calculation.
 * RULE: Unknown shipping or pricing terms CANNOT be treated as ₹0!
 */
export function calculateLandedCost(terms: Partial<CommercialTerms>): CalculationResult {
  const missingFields: string[] = [];

  const unitPrice = terms.unitPrice ?? 0;
  const quantity = terms.quantity ?? 0;
  const taxes = terms.taxes ?? 0;
  const additionalFees = terms.additionalFees ?? 0;

  if (terms.unitPrice === undefined || terms.unitPrice === null) {
    missingFields.push('Unit Price');
  }
  if (terms.quantity === undefined || terms.quantity === null || terms.quantity <= 0) {
    missingFields.push('Quantity');
  }
  if (terms.shippingCost === undefined || terms.shippingCost === null) {
    missingFields.push('Shipping Cost');
  }

  const subtotal = Math.round(unitPrice * quantity);
  const isComplete = missingFields.length === 0;

  let totalLandedCost: number | null = null;
  if (isComplete && terms.shippingCost !== null) {
    totalLandedCost = Math.round(subtotal + taxes + (terms.shippingCost ?? 0) + additionalFees);
  }

  const formula = `(${unitPrice} × ${quantity}) + taxes(${taxes}) + shipping(${terms.shippingCost ?? 'UNKNOWN'}) + fees(${additionalFees})`;

  return {
    subtotal,
    totalLandedCost,
    isComplete,
    missingFields,
    formula,
  };
}

export interface EligibilityResult {
  isEligible: boolean;
  violations: string[];
}

/**
 * Negotiation Guard: validates an offer against the buyer's non-negotiable mandate
 */
export function validateOfferPolicy(
  mandate: NegotiationMandate,
  terms: CommercialTerms
): EligibilityResult {
  const violations: string[] = [];

  // Check 1: Total landed cost vs hard budget ceiling
  if (terms.totalLandedCost !== null) {
    if (terms.totalLandedCost > mandate.maxBudget) {
      violations.push(
        `Total Landed Cost ₹${terms.totalLandedCost.toLocaleString()} exceeds authorized budget ceiling of ₹${mandate.maxBudget.toLocaleString()}`
      );
    }
  } else if (terms.subtotal > mandate.maxBudget) {
    violations.push(
      `Subtotal ₹${terms.subtotal.toLocaleString()} already exceeds total budget of ₹${mandate.maxBudget.toLocaleString()} without shipping`
    );
  }

  // Check 2: Quantity match
  if (terms.quantity < mandate.quantity) {
    violations.push(
      `Offered quantity (${terms.quantity}) is less than mandatory quantity (${mandate.quantity})`
    );
  }

  // Check 3: Delivery deadline
  if (terms.deliveryDays !== null && terms.deliveryDays > mandate.deliveryDeadlineDays) {
    violations.push(
      `Delivery timeframe (${terms.deliveryDays} days) exceeds maximum deadline of ${mandate.deliveryDeadlineDays} days`
    );
  }

  // Check 4: Minimum warranty
  if (terms.warrantyMonths !== null && terms.warrantyMonths < mandate.minWarrantyMonths) {
    violations.push(
      `Warranty offered (${terms.warrantyMonths} months) does not meet minimum requirement of ${mandate.minWarrantyMonths} months`
    );
  }

  return {
    isEligible: violations.length === 0,
    violations,
  };
}

/**
 * Deal Decision Engine: Ranks eligible offers by total landed cost, with tie-breakers
 */
export function rankEligibleOffers(
  offers: MerchantOffer[],
  mandate: NegotiationMandate
): MerchantOffer[] {
  return [...offers]
    .filter((offer) => {
      const eligibility = validateOfferPolicy(mandate, offer.terms);
      return eligibility.isEligible && offer.terms.totalLandedCost !== null;
    })
    .sort((a, b) => {
      const costA = a.terms.totalLandedCost ?? Infinity;
      const costB = b.terms.totalLandedCost ?? Infinity;
      if (costA !== costB) return costA - costB;

      // Tie breaker 1: Shorter delivery
      const delA = a.terms.deliveryDays ?? Infinity;
      const delB = b.terms.deliveryDays ?? Infinity;
      if (delA !== delB) return delA - delB;

      // Tie breaker 2: Longer warranty
      const warA = a.terms.warrantyMonths ?? 0;
      const warB = b.terms.warrantyMonths ?? 0;
      return warB - warA;
    });
}
