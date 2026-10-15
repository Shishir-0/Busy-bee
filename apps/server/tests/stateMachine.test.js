import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionOffer, canTransitionSession } from '../src/policies/stateMachine.js';
describe('State Machine Tests', () => {
    it('allows valid offer state transitions', () => {
        assert.equal(canTransitionOffer('proposed', 'merchant_confirmed'), true);
        assert.equal(canTransitionOffer('proposed', 'countered'), true);
        assert.equal(canTransitionOffer('countered', 'merchant_confirmed'), true);
        assert.equal(canTransitionOffer('merchant_confirmed', 'ready_for_buyer_review'), true);
    });
    it('rejects invalid offer state transitions', () => {
        // Cannot jump from rejected to merchant_confirmed
        assert.equal(canTransitionOffer('rejected', 'merchant_confirmed'), false);
        // Cannot jump from ready_for_buyer_review to proposed without counter
        assert.equal(canTransitionOffer('ready_for_buyer_review', 'proposed'), false);
    });
    it('enforces session lifecycle transitions and terminal states', () => {
        assert.equal(canTransitionSession('created', 'active'), true);
        assert.equal(canTransitionSession('active', 'ended'), true);
        // Once ended, session cannot transition back to active
        assert.equal(canTransitionSession('ended', 'active'), false);
        // Once failed, session cannot transition to active
        assert.equal(canTransitionSession('failed', 'active'), false);
    });
});
//# sourceMappingURL=stateMachine.test.js.map