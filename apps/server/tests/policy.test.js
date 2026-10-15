import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateNegotiationPolicy } from '../src/policies/negotiationGuard.js';
const mockMandate = {
    id: 'neg-chair-01',
    objective: 'Procure 50 ergonomic office chairs',
    quantity: 50,
    currency: 'INR',
    maxBudget: 150000,
    deliveryDeadlineDays: 5,
    minWarrantyMonths: 12,
    mandatorySpecifications: ['Ergonomic mesh back', 'Adjustable lumbar support'],
    counterOfferPolicy: { allowSplitShipment: false },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
const mockActiveSession = {
    id: 'ses-active-01',
    negotiationId: 'neg-chair-01',
    merchantName: 'FurniTech Solutions',
    merchantRole: 'sales_representative',
    roomId: 'room-chair-01',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
describe('Negotiation Guard Policy Tests', () => {
    it('allows an offer that meets all budget, quantity, warranty, and delivery constraints', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 2850,
                quantity: 50,
                shippingFee: 4000,
                isShippingIncluded: false,
                isTaxIncluded: true,
                deliveryDays: 4,
                warrantyMonths: 12,
                specifications: ['Ergonomic mesh back', 'Adjustable lumbar support', 'Tilt lock'],
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, true);
        assert.equal(result.decision, 'allowed');
        assert.equal(result.calculatedTotalCost, 146500);
        assert.equal(result.violations.length, 0);
    });
    it('strictly rejects an offer that exceeds the maximum budget', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 3100, // 50 * 3100 = 155,000 > 150,000
                quantity: 50,
                isShippingIncluded: true,
                isTaxIncluded: true,
                deliveryDays: 3,
                warrantyMonths: 12,
                specifications: ['Ergonomic mesh back', 'Adjustable lumbar support'],
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, false);
        assert.equal(result.decision, 'denied');
        assert.equal(result.denialCode, 'POLICY_VIOLATION');
        assert.ok(result.violations.some((v) => v.includes('exceeds authorized maximum budget')));
    });
    it('rejects an offer with insufficient quantity', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 2800,
                quantity: 40, // Required 50
                isShippingIncluded: true,
                deliveryDays: 3,
                warrantyMonths: 12,
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, false);
        assert.ok(result.violations.some((v) => v.includes('less than required mandate quantity')));
    });
    it('rejects an offer that fails the minimum warranty requirement', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 2800,
                quantity: 50,
                isShippingIncluded: true,
                warrantyMonths: 6, // Required 12
                deliveryDays: 3,
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, false);
        assert.ok(result.violations.some((v) => v.includes('less than required minimum warranty')));
    });
    it('rejects an offer that misses the delivery deadline', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 2800,
                quantity: 50,
                isShippingIncluded: true,
                deliveryDays: 8, // Max deadline 5
                warrantyMonths: 12,
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, false);
        assert.ok(result.violations.some((v) => v.includes('exceeds maximum deadline')));
    });
    it('flags missing shipping as incomplete and refuses to certify acceptance without explicit shipping', () => {
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: mockActiveSession,
            proposedTerms: {
                unitPrice: 2800,
                quantity: 50,
                // shippingFee omitted and isShippingIncluded omitted -> unknown!
                deliveryDays: 3,
                warrantyMonths: 12,
            },
            actionType: 'accept_terms',
        });
        assert.equal(result.isAllowed, false);
        assert.ok(result.violations.some((v) => v.includes('Shipping cost is unknown')) ||
            result.decision === 'needs_clarification');
    });
    it('rejects mutations when session is inactive or ended', () => {
        const endedSession = {
            ...mockActiveSession,
            status: 'ended',
        };
        const result = evaluateNegotiationPolicy({
            mandate: mockMandate,
            session: endedSession,
            proposedTerms: {
                unitPrice: 2800,
                quantity: 50,
                isShippingIncluded: true,
            },
            actionType: 'propose_offer',
        });
        assert.equal(result.isAllowed, false);
        assert.equal(result.decision, 'session_not_active');
        assert.equal(result.denialCode, 'SESSION_NOT_ACTIVE');
    });
});
//# sourceMappingURL=policy.test.js.map