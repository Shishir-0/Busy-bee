import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvidenceEvent } from '../src/policies/evidenceValidator.js';
import { InMemoryEvidenceRepository } from '../src/repositories/inMemoryRepository.js';
describe('Evidence Validation and Provenance Tests', () => {
    it('marks evidence verified when numbers in transcript match extracted terms', () => {
        const event = {
            eventId: 'evt-test-101',
            negotiationId: 'neg-1',
            sessionId: 'ses-1',
            sourceTurnId: 'turn-12',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: 'Yes, we can do 2850 per chair, and shipping will be 4000 total with 12 months warranty.',
            extractedTerms: {
                unitPrice: 2850,
                shippingFee: 4000,
                warrantyMonths: 12,
            },
        };
        const result = validateEvidenceEvent(event);
        assert.equal(result.isValid, true);
        assert.equal(result.authorizedStatus, 'verified');
        assert.ok(result.reason.includes('extracted terms match spoken merchant statement'));
    });
    it('rejects evidence when source transcript turn is missing or empty', () => {
        const event = {
            eventId: 'evt-test-102',
            negotiationId: 'neg-1',
            sessionId: 'ses-1',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: '   ',
            extractedTerms: {
                unitPrice: 2800,
            },
        };
        const result = validateEvidenceEvent(event);
        assert.equal(result.isValid, false);
        assert.equal(result.authorizedStatus, 'unverified');
    });
    it('guarantees idempotency on duplicate eventId submissions', async () => {
        const repo = new InMemoryEvidenceRepository();
        const first = await repo.create({
            id: 'evi-first-1',
            eventId: 'evt-unique-dup-1',
            negotiationId: 'neg-1',
            sessionId: 'ses-1',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: '2900 with free delivery',
            extractedTerms: { unitPrice: 2900, isShippingIncluded: true },
            verificationStatus: 'verified',
            verificationReason: 'Matched',
        });
        // Replay same eventId
        const second = await repo.create({
            id: 'evi-second-2', // different id attempt
            eventId: 'evt-unique-dup-1', // same eventId
            negotiationId: 'neg-1',
            sessionId: 'ses-1',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: '2900 with free delivery',
            extractedTerms: { unitPrice: 2900, isShippingIncluded: true },
            verificationStatus: 'verified',
            verificationReason: 'Matched',
        });
        assert.equal(second.id, first.id); // Returns the original record!
        const all = await repo.findByNegotiationId('neg-1');
        assert.equal(all.length, 1); // No duplicate record created!
    });
});
//# sourceMappingURL=evidence.test.js.map