import { Router } from 'express';
import { createNegotiation, listNegotiations, getNegotiation, createSession, issueSessionToken, getNegotiationOffers, getNegotiationEvidence, calculateRecommendation, streamNegotiationEvents, } from '../controllers/negotiationController.js';
import { getDatabaseHealth } from '../config/database.js';
import { eventBus } from '../events/eventBus.js';
export const apiRouter = Router();
// Health Check Endpoint
apiRouter.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'the-negotiator-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: getDatabaseHealth(),
        sseClients: eventBus.getActiveClientCount(),
    });
});
// Buyer-facing Negotiation Endpoints
apiRouter.post('/negotiations', createNegotiation);
apiRouter.get('/negotiations', listNegotiations);
apiRouter.get('/negotiations/:id', getNegotiation);
apiRouter.post('/negotiations/:id/sessions', createSession);
apiRouter.get('/negotiations/:id/offers', getNegotiationOffers);
apiRouter.get('/negotiations/:id/evidence', getNegotiationEvidence);
apiRouter.post('/negotiations/:id/recommendation', calculateRecommendation);
apiRouter.get('/negotiations/:id/events', streamNegotiationEvents);
// Session Endpoints
apiRouter.post('/sessions/:id/token', issueSessionToken);
//# sourceMappingURL=apiRoutes.js.map