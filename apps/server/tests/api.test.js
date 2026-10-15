import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
const app = createApp();
describe('End-to-End API Integration Tests', () => {
    let createdNegotiationId = '';
    let createdSessionId = '';
    it('GET /api/health returns 200 and accurate database status', async () => {
        const res = await request(app).get('/api/health');
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'ok');
        assert.equal(res.body.service, 'the-negotiator-backend');
        assert.ok(res.body.database);
        assert.ok(res.body.database.persistenceMode);
    });
    it('POST /api/negotiations creates and persists a valid buyer mandate', async () => {
        const payload = {
            objective: 'Procure 50 ergonomic chairs for engineering floor',
            quantity: 50,
            currency: 'INR',
            maxBudget: 150000,
            deliveryDeadlineDays: 5,
            minWarrantyMonths: 12,
            mandatorySpecifications: ['Ergonomic mesh back', 'Adjustable lumbar support'],
            counterOfferPolicy: { maxUnitConcession: 200 },
        };
        const res = await request(app).post('/api/negotiations').send(payload);
        assert.equal(res.status, 201);
        assert.ok(res.body.id);
        assert.equal(res.body.objective, payload.objective);
        assert.equal(res.body.maxBudget, 150000);
        assert.equal(res.body.status, 'active');
        createdNegotiationId = res.body.id;
    });
    it('POST /api/negotiations rejects invalid payloads with standard error envelope', async () => {
        const invalidPayload = {
            objective: '', // empty
            quantity: -5, // negative
            currency: 'USD', // not supported
        };
        const res = await request(app).post('/api/negotiations').send(invalidPayload);
        assert.equal(res.status, 400);
        assert.equal(res.body.error.code, 'VALIDATION_ERROR');
        assert.ok(Array.isArray(res.body.error.details));
    });
    it('POST /api/negotiations/:id/sessions starts an active merchant session', async () => {
        const res = await request(app)
            .post(`/api/negotiations/${createdNegotiationId}/sessions`)
            .send({
            merchantName: 'FurniTech Solutions',
            merchantRole: 'senior_sales_rep',
        });
        assert.equal(res.status, 201);
        assert.ok(res.body.id);
        assert.equal(res.body.merchantName, 'FurniTech Solutions');
        assert.equal(res.body.status, 'active');
        assert.ok(res.body.roomId);
        createdSessionId = res.body.id;
    });
    it('POST /api/sessions/:id/token issues a short-lived LiveKit token', async () => {
        const res = await request(app)
            .post(`/api/sessions/${createdSessionId}/token`)
            .send({
            participantIdentity: 'merchant_sales_user_1',
            role: 'merchant',
        });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
        assert.ok(res.body.roomName);
        assert.equal(res.body.participantIdentity, 'merchant_sales_user_1');
    });
    it('rejects unauthenticated requests to internal AI agent routes', async () => {
        const res = await request(app).get(`/api/internal/negotiations/${createdNegotiationId}/context`);
        assert.equal(res.status, 401);
        assert.equal(res.body.error.code, 'UNAUTHORIZED_AGENT_ACTION');
    });
    it('allows authenticated requests to internal AI agent routes with x-agent-token', async () => {
        const res = await request(app)
            .get(`/api/internal/negotiations/${createdNegotiationId}/context`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN);
        assert.equal(res.status, 200);
        assert.equal(res.body.negotiationId, createdNegotiationId);
        assert.equal(res.body.maxBudget, 150000);
    });
    it('POST /api/internal/sessions/:id/observations ingests observation and updates offer', async () => {
        const obsPayload = {
            eventId: 'evt-obs-chair-001',
            negotiationId: createdNegotiationId,
            sessionId: createdSessionId,
            sourceTurnId: 'turn-04',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: 'We can supply 50 chairs at 2850 each, with 4000 shipping and 12 months warranty.',
            extractedTerms: {
                unitPrice: 2850,
                quantity: 50,
                shippingFee: 4000,
                isShippingIncluded: false,
                deliveryDays: 4,
                warrantyMonths: 12,
                specifications: ['Ergonomic mesh back', 'Adjustable lumbar support'],
            },
        };
        const res = await request(app)
            .post(`/api/internal/sessions/${createdSessionId}/observations`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN)
            .send(obsPayload);
        assert.equal(res.status, 201);
        assert.equal(res.body.isIdempotentReplay, false);
        assert.equal(res.body.evidence.verificationStatus, 'verified');
        assert.equal(res.body.offer.costBreakdown.totalLandedCost, 146500);
        assert.equal(res.body.offer.status, 'proposed');
    });
    it('guarantees idempotency when observation event is replayed', async () => {
        const obsPayload = {
            eventId: 'evt-obs-chair-001', // same eventId
            negotiationId: createdNegotiationId,
            sessionId: createdSessionId,
            sourceTurnId: 'turn-04',
            timestamp: new Date().toISOString(),
            speaker: 'merchant',
            sourceText: 'We can supply 50 chairs at 2850 each, with 4000 shipping and 12 months warranty.',
            extractedTerms: { unitPrice: 2850, quantity: 50, shippingFee: 4000 },
        };
        const res = await request(app)
            .post(`/api/internal/sessions/${createdSessionId}/observations`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN)
            .send(obsPayload);
        assert.equal(res.status, 200);
        assert.equal(res.body.isIdempotentReplay, true);
    });
    it('POST /api/internal/sessions/:id/actions/authorize validates action against Negotiation Guard', async () => {
        const res = await request(app)
            .post(`/api/internal/sessions/${createdSessionId}/actions/authorize`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN)
            .send({
            actionType: 'confirm_merchant_offer',
            proposedTerms: { unitPrice: 2850, shippingFee: 4000 },
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.isAllowed, true);
        assert.equal(res.body.decision, 'allowed');
    });
    it('POST /api/internal/sessions/:id/confirmations advances offer to merchant_confirmed', async () => {
        const res = await request(app)
            .post(`/api/internal/sessions/${createdSessionId}/confirmations`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN)
            .send({});
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'merchant_confirmed');
    });
    it('POST /api/negotiations/:id/recommendation produces an explainable recommendation', async () => {
        const res = await request(app)
            .post(`/api/negotiations/${createdNegotiationId}/recommendation`)
            .send({});
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'ready_for_review');
        assert.equal(res.body.winnerMerchantName, 'FurniTech Solutions');
        assert.equal(res.body.eligibleOffers.length, 1);
        assert.equal(res.body.eligibleOffers[0].costBreakdown.totalLandedCost, 146500);
    });
    it('POST /api/internal/sessions/:id/end closes active session cleanly', async () => {
        const res = await request(app)
            .post(`/api/internal/sessions/${createdSessionId}/end`)
            .set('x-agent-token', env.AGENT_BACKEND_TOKEN)
            .send({});
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'ended');
        assert.ok(res.body.endedAt);
    });
});
//# sourceMappingURL=api.test.js.map