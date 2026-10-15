import { Router } from 'express';
import {
  createNegotiation,
  listNegotiations,
  getNegotiation,
  createSession,
  listSessions,
  issueSessionToken,
  getNegotiationOffers,
  getNegotiationEvidence,
  getNegotiationViolations,
  calculateRecommendation,
  getRecommendation,
  approveRecommendation,
  streamNegotiationEvents,
} from '../controllers/negotiationController.js';
import {
  getAgentNegotiationContext,
  ingestObservation,
  authorizeAgentAction,
  confirmMerchantOffer,
  endSession,
} from '../controllers/internalAgentController.js';
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
apiRouter.get('/negotiations/:id/sessions', listSessions);
apiRouter.post('/negotiations/:id/sessions', createSession);
apiRouter.get('/negotiations/:id/offers', getNegotiationOffers);
apiRouter.get('/negotiations/:id/evidence', getNegotiationEvidence);
apiRouter.get('/negotiations/:id/violations', getNegotiationViolations);
apiRouter.get('/negotiations/:id/recommendation', getRecommendation);
apiRouter.post('/negotiations/:id/recommendation', calculateRecommendation);
apiRouter.post('/negotiations/:id/recommendation/approve', approveRecommendation);
apiRouter.get('/negotiations/:id/events', streamNegotiationEvents);

// Session Endpoints
apiRouter.post('/sessions/:id/token', issueSessionToken);

// AI Agent Direct Client Endpoints (matching @busy-bee/agent client.ts route patterns)
apiRouter.get('/negotiations/:negotiationId/sessions/:sessionId/context', getAgentNegotiationContext);
apiRouter.post('/negotiations/:negotiationId/sessions/:sessionId/observations', ingestObservation);
apiRouter.post('/negotiations/:negotiationId/sessions/:sessionId/actions', authorizeAgentAction);
apiRouter.post('/negotiations/:negotiationId/sessions/:sessionId/confirmations', confirmMerchantOffer);
apiRouter.post('/negotiations/:negotiationId/sessions/:sessionId/end', endSession);
