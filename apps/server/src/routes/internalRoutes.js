import { Router } from 'express';
import { getAgentNegotiationContext, ingestObservation, authorizeAgentAction, confirmMerchantOffer, endSession, } from '../controllers/internalAgentController.js';
import { internalAgentAuth } from '../middleware/auth.js';
export const internalRouter = Router();
// Enforce agent-to-backend authentication on all internal routes
internalRouter.use(internalAgentAuth);
internalRouter.get('/negotiations/:id/context', getAgentNegotiationContext);
internalRouter.post('/sessions/:id/observations', ingestObservation);
internalRouter.post('/sessions/:id/actions/authorize', authorizeAgentAction);
internalRouter.post('/sessions/:id/confirmations', confirmMerchantOffer);
internalRouter.post('/sessions/:id/end', endSession);
//# sourceMappingURL=internalRoutes.js.map