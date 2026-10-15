import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLandedCost } from '../src/policies/costEngine.js';
import { evaluateRecommendation } from '../src/policies/recommendationEngine.js';
import type {
  NegotiationMandate,
  OfferRecord,
  EvidenceRecord,
} from '../../../packages/shared/src/contracts.js';

describe('Deterministic Cost Calculation & Recommendation Tests', () => {
  it('calculates exact landed cost for Merchant A scenario (₹146,500)', () => {
    // Merchant A: 50 chairs @ ₹2,850/chair, ₹4,000 shipping, taxes included
    const breakdown = calculateLandedCost(
      {
        unitPrice: 2850,
        quantity: 50,
        shippingFee: 4000,
        isShippingIncluded: false,
        isTaxIncluded: true,
      },
      50
    );

    assert.equal(breakdown.productSubtotal, 142500);
    assert.equal(breakdown.shippingFee, 4000);
    assert.equal(breakdown.isShippingKnown, true);
    assert.equal(breakdown.taxesAmount, 0);
    assert.equal(breakdown.totalLandedCost, 146500);
    assert.equal(breakdown.isComplete, true);
    assert.equal(breakdown.missingComponents.length, 0);
  });

  it('calculates exact landed cost for Merchant B scenario (₹145,000)', () => {
    // Merchant B: 50 chairs @ ₹2,900/chair, shipping included, taxes included
    const breakdown = calculateLandedCost(
      {
        unitPrice: 2900,
        quantity: 50,
        isShippingIncluded: true,
        isTaxIncluded: true,
      },
      50
    );

    assert.equal(breakdown.productSubtotal, 145000);
    assert.equal(breakdown.shippingFee, 0);
    assert.equal(breakdown.isShippingKnown, true);
    assert.equal(breakdown.isShippingIncludedInProduct, true);
    assert.equal(breakdown.taxesAmount, 0);
    assert.equal(breakdown.totalLandedCost, 145000);
    assert.equal(breakdown.isComplete, true);
  });

  it('never assumes unknown shipping is zero', () => {
    const breakdown = calculateLandedCost(
      {
        unitPrice: 2800,
        quantity: 50,
        // No shipping fee or isShippingIncluded provided
      },
      50
    );

    assert.equal(breakdown.productSubtotal, 140000);
    assert.equal(breakdown.isShippingKnown, false);
    assert.equal(breakdown.isComplete, false);
    assert.ok(breakdown.missingComponents.includes('shipping_fee'));
  });

  it('ranks Merchant B first because ₹145,000 < ₹146,500 and both satisfy mandate', () => {
    const mandate: NegotiationMandate = {
      id: 'neg-compare-01',
      objective: 'Bulk 50 chairs',
      quantity: 50,
      currency: 'INR',
      maxBudget: 150000,
      deliveryDeadlineDays: 5,
      minWarrantyMonths: 12,
      mandatorySpecifications: ['Ergonomic mesh back'],
      counterOfferPolicy: { allowSplitShipment: false },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const offerA: OfferRecord = {
      id: 'off-merchant-a',
      negotiationId: 'neg-compare-01',
      sessionId: 'ses-a',
      merchantName: 'Merchant A (OfficeWorld)',
      revision: 2,
      status: 'merchant_confirmed',
      terms: {
        unitPrice: 2850,
        quantity: 50,
        shippingFee: 4000,
        isShippingIncluded: false,
        isTaxIncluded: true,
        deliveryDays: 4,
        warrantyMonths: 12,
        specifications: ['Ergonomic mesh back'],
      },
      costBreakdown: calculateLandedCost(
        { unitPrice: 2850, quantity: 50, shippingFee: 4000, isShippingIncluded: false, isTaxIncluded: true },
        50
      ),
      supportingEvidenceIds: ['evi-a1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const offerB: OfferRecord = {
      id: 'off-merchant-b',
      negotiationId: 'neg-compare-01',
      sessionId: 'ses-b',
      merchantName: 'Merchant B (SeatingDirect)',
      revision: 2,
      status: 'merchant_confirmed',
      terms: {
        unitPrice: 2900,
        quantity: 50,
        isShippingIncluded: true,
        isTaxIncluded: true,
        deliveryDays: 3,
        warrantyMonths: 12,
        specifications: ['Ergonomic mesh back'],
      },
      costBreakdown: calculateLandedCost(
        { unitPrice: 2900, quantity: 50, isShippingIncluded: true, isTaxIncluded: true },
        50
      ),
      supportingEvidenceIds: ['evi-b1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const evidenceList: EvidenceRecord[] = [
      {
        id: 'evi-a1',
        eventId: 'evt-a1',
        negotiationId: 'neg-compare-01',
        sessionId: 'ses-a',
        timestamp: new Date().toISOString(),
        speaker: 'merchant',
        sourceText: 'We can do 2850 each with 4000 delivery.',
        extractedTerms: offerA.terms,
        verificationStatus: 'verified',
        verificationReason: 'Confirmed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'evi-b1',
        eventId: 'evt-b1',
        negotiationId: 'neg-compare-01',
        sessionId: 'ses-b',
        timestamp: new Date().toISOString(),
        speaker: 'merchant',
        sourceText: '2900 each and shipping is free included.',
        extractedTerms: offerB.terms,
        verificationStatus: 'verified',
        verificationReason: 'Confirmed',
        createdAt: new Date().toISOString(),
      },
    ];

    const recommendation = evaluateRecommendation(mandate, [offerA, offerB], evidenceList);

    assert.equal(recommendation.status, 'ready_for_review');
    assert.equal(recommendation.winnerOfferId, 'off-merchant-b');
    assert.equal(recommendation.winnerMerchantName, 'Merchant B (SeatingDirect)');
    assert.equal(recommendation.eligibleOffers.length, 2);
    assert.equal(recommendation.eligibleOffers[0].costBreakdown.totalLandedCost, 145000);
    assert.equal(recommendation.eligibleOffers[1].costBreakdown.totalLandedCost, 146500);
  });
});
