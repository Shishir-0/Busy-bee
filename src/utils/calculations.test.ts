import { describe, it, expect } from 'vitest';
import { calculateLandedCost, validateOfferPolicy, rankEligibleOffers } from './calculations';
import { NegotiationMandate, MerchantOffer } from '../types/negotiation';

describe('Deterministic Calculations & Policy Enforcement', () => {
  const mockMandate: NegotiationMandate = {
    id: 'mandate-chairs-50',
    title: '50 Ergonomic Mesh Task Chairs',
    objective: 'Procure 50 high-durability ergonomic chairs for Bangalore tech hub',
    quantity: 50,
    currency: 'INR',
    maxBudget: 150000,
    deliveryDeadlineDays: 5,
    minWarrantyMonths: 12,
    mandatorySpecs: ['Adjustable lumbar support', 'BIFMA level 2 certified'],
    authority: {
      targetUnitPrice: 2600,
      maxUnitPrice: 2900,
      permittedConcessions: ['Net 15 payment terms'],
      strictBudgetCap: true,
      maxDeliveryDays: 5,
      minWarrantyMonths: 12,
    },
    status: 'negotiating',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  };

  it('calculates total landed cost accurately when all terms are present', () => {
    const terms = {
      unitPrice: 2800,
      quantity: 50,
      subtotal: 140000,
      taxes: 2500,
      shippingCost: 2500,
      additionalFees: 0,
      deliveryDays: 4,
      warrantyMonths: 12,
    };

    const result = calculateLandedCost(terms);
    expect(result.subtotal).toBe(140000);
    expect(result.totalLandedCost).toBe(145000);
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('strictly treats missing shipping cost as incomplete and null, never ₹0', () => {
    const termsWithUnknownShipping = {
      unitPrice: 2800,
      quantity: 50,
      subtotal: 140000,
      taxes: 2500,
      shippingCost: null, // Unknown!
      additionalFees: 0,
      deliveryDays: 4,
      warrantyMonths: 12,
    };

    const result = calculateLandedCost(termsWithUnknownShipping);
    expect(result.totalLandedCost).toBeNull();
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain('Shipping Cost');
  });

  it('Negotiation Guard rejects offers exceeding total budget ceiling', () => {
    const overBudgetTerms = {
      unitPrice: 3200,
      quantity: 50,
      subtotal: 160000,
      taxes: 3000,
      shippingCost: 2000,
      additionalFees: 0,
      totalLandedCost: 165000, // Exceeds ₹150,000!
      deliveryDays: 4,
      warrantyMonths: 12,
    };

    const check = validateOfferPolicy(mockMandate, overBudgetTerms);
    expect(check.isEligible).toBe(false);
    expect(check.violations.some((v) => v.includes('exceeds authorized budget ceiling'))).toBe(true);
  });

  it('Negotiation Guard rejects offers failing delivery deadline or warranty threshold', () => {
    const slowDeliveryTerms = {
      unitPrice: 2700,
      quantity: 50,
      subtotal: 135000,
      taxes: 2000,
      shippingCost: 3000,
      additionalFees: 0,
      totalLandedCost: 140000,
      deliveryDays: 8, // Exceeds 5 days!
      warrantyMonths: 6, // Less than 12 months!
    };

    const check = validateOfferPolicy(mockMandate, slowDeliveryTerms);
    expect(check.isEligible).toBe(false);
    expect(check.violations).toHaveLength(2);
    expect(check.violations.some((v) => v.includes('deadline'))).toBe(true);
    expect(check.violations.some((v) => v.includes('Warranty'))).toBe(true);
  });

  it('Deal Decision Engine ranks lowest landed cost first among eligible offers', () => {
    const offerA: MerchantOffer = {
      id: 'offer-a',
      negotiationId: mockMandate.id,
      sessionId: 'sess-a',
      merchantName: 'Apex Office Supplies',
      revision: 2,
      status: 'merchant_confirmed',
      terms: {
        unitPrice: 2850,
        quantity: 50,
        subtotal: 142500,
        taxes: 2000,
        shippingCost: 2000,
        additionalFees: 0,
        totalLandedCost: 146500,
        deliveryDays: 4,
        warrantyMonths: 12,
      },
      isEligible: true,
      evidenceIds: ['ev-1', 'ev-2'],
      updatedAt: '2026-10-15T11:00:00Z',
    };

    const offerB: MerchantOffer = {
      id: 'offer-b',
      negotiationId: mockMandate.id,
      sessionId: 'sess-b',
      merchantName: 'Sterling Commercial Furniture',
      revision: 1,
      status: 'merchant_confirmed',
      terms: {
        unitPrice: 2800,
        quantity: 50,
        subtotal: 140000,
        taxes: 2500,
        shippingCost: 2500,
        additionalFees: 0,
        totalLandedCost: 145000, // Cheaper than A!
        deliveryDays: 3,
        warrantyMonths: 18,
      },
      isEligible: true,
      evidenceIds: ['ev-3', 'ev-4'],
      updatedAt: '2026-10-15T11:30:00Z',
    };

    const ranked = rankEligibleOffers([offerA, offerB], mockMandate);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].id).toBe('offer-b'); // Offer B wins: ₹145,000 < ₹146,500
    expect(ranked[1].id).toBe('offer-a');
  });
});
