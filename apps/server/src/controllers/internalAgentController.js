import { v4 as uuidv4 } from 'uuid';
import { ObservationEventSchema, AuthorizeActionSchema, } from '../../../../packages/shared/src/contracts.js';
import { getRepositories } from '../config/database.js';
import { eventBus } from '../events/eventBus.js';
import { validateEvidenceEvent } from '../policies/evidenceValidator.js';
import { evaluateNegotiationPolicy } from '../policies/negotiationGuard.js';
import { calculateLandedCost } from '../policies/costEngine.js';
import { canTransitionOffer, canTransitionSession } from '../policies/stateMachine.js';
import { getParam } from '../lib/params.js';
export async function getAgentNegotiationContext(req, res, next) {
    try {
        const negotiationId = getParam(req.params.id);
        const repos = getRepositories();
        const negotiation = await repos.negotiations.findById(negotiationId);
        if (!negotiation) {
            res.status(404).json({
                error: { code: 'NEGOTIATION_NOT_FOUND', message: `Negotiation ${negotiationId} not found.`, requestId: req.id },
            });
            return;
        }
        // Return the minimum authorized negotiation context
        res.json({
            negotiationId: negotiation.id,
            objective: negotiation.objective,
            quantity: negotiation.quantity,
            currency: negotiation.currency,
            maxBudget: negotiation.maxBudget,
            deliveryDeadlineDays: negotiation.deliveryDeadlineDays,
            minWarrantyMonths: negotiation.minWarrantyMonths,
            mandatorySpecifications: negotiation.mandatorySpecifications,
            status: negotiation.status,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function ingestObservation(req, res, next) {
    try {
        const sessionId = getParam(req.params.id);
        const input = ObservationEventSchema.parse(req.body);
        const repos = getRepositories();
        const session = await repos.sessions.findById(sessionId);
        if (!session) {
            res.status(404).json({
                error: { code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.`, requestId: req.id },
            });
            return;
        }
        if (session.status !== 'active') {
            res.status(400).json({
                error: {
                    code: 'SESSION_NOT_ACTIVE',
                    message: `Cannot ingest observations into session with status "${session.status}".`,
                    requestId: req.id,
                },
            });
            return;
        }
        const negotiation = await repos.negotiations.findById(session.negotiationId);
        if (!negotiation) {
            res.status(404).json({
                error: { code: 'NEGOTIATION_NOT_FOUND', message: `Negotiation not found.`, requestId: req.id },
            });
            return;
        }
        // 1. Idempotency Check: check if eventId already processed
        const existingEvidence = await repos.evidence.findByEventId(input.eventId);
        if (existingEvidence) {
            res.status(200).json({
                evidence: existingEvidence,
                isIdempotentReplay: true,
            });
            return;
        }
        // 2. Validate Evidence against source transcript turn
        const validation = validateEvidenceEvent(input);
        const evidenceId = `evi-${uuidv4().slice(0, 8)}`;
        const evidenceRecord = await repos.evidence.create({
            id: evidenceId,
            eventId: input.eventId,
            negotiationId: session.negotiationId,
            sessionId,
            sourceTurnId: input.sourceTurnId,
            timestamp: typeof input.timestamp === 'number' ? new Date(input.timestamp).toISOString() : input.timestamp,
            speaker: input.speaker,
            sourceText: input.sourceText,
            extractedTerms: input.extractedTerms,
            verificationStatus: validation.authorizedStatus,
            verificationReason: validation.reason,
        });
        eventBus.publish('evidence.recorded', session.negotiationId, evidenceRecord, sessionId);
        // 3. Update or create Offer Record for this session
        const existingOffer = await repos.offers.findBySessionId(sessionId);
        const currentRevision = existingOffer ? existingOffer.revision + 1 : 1;
        const mergedTerms = {
            ...(existingOffer?.terms || {}),
            ...input.extractedTerms,
        };
        const costBreakdown = calculateLandedCost(mergedTerms, negotiation.quantity);
        const offerStatus = costBreakdown.isComplete ? 'proposed' : 'incomplete';
        const offerId = existingOffer ? existingOffer.id : `off-${uuidv4().slice(0, 8)}`;
        const supportingEvidenceIds = Array.from(new Set([...(existingOffer?.supportingEvidenceIds || []), evidenceId]));
        const updatedOffer = await repos.offers.createOrUpdate({
            id: offerId,
            negotiationId: session.negotiationId,
            sessionId,
            merchantName: session.merchantName,
            revision: currentRevision,
            status: offerStatus,
            terms: mergedTerms,
            costBreakdown,
            supportingEvidenceIds,
        });
        const eventType = existingOffer ? 'offer.revised' : 'offer.proposed';
        eventBus.publish(eventType, session.negotiationId, updatedOffer, sessionId, offerId);
        res.status(201).json({
            evidence: evidenceRecord,
            offer: updatedOffer,
            isIdempotentReplay: false,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function authorizeAgentAction(req, res, next) {
    try {
        const sessionId = getParam(req.params.id);
        const input = AuthorizeActionSchema.parse(req.body);
        const repos = getRepositories();
        const session = await repos.sessions.findById(sessionId);
        if (!session) {
            res.status(404).json({
                error: { code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.`, requestId: req.id },
            });
            return;
        }
        const negotiation = await repos.negotiations.findById(session.negotiationId);
        if (!negotiation) {
            res.status(404).json({
                error: { code: 'NEGOTIATION_NOT_FOUND', message: 'Negotiation not found.', requestId: req.id },
            });
            return;
        }
        // Merge existing offer terms if available
        const existingOffer = await repos.offers.findBySessionId(sessionId);
        const effectiveTerms = {
            ...(existingOffer?.terms || {}),
            ...input.proposedTerms,
        };
        const policyResult = evaluateNegotiationPolicy({
            mandate: negotiation,
            session,
            proposedTerms: effectiveTerms,
            actionType: input.actionType,
        });
        if (!policyResult.isAllowed) {
            eventBus.publish('policy.denied', session.negotiationId, {
                sessionId,
                denialCode: policyResult.denialCode,
                reason: policyResult.reason,
                violations: policyResult.violations,
            });
        }
        res.json(policyResult);
    }
    catch (err) {
        next(err);
    }
}
export async function confirmMerchantOffer(req, res, next) {
    try {
        const sessionId = getParam(req.params.id);
        const repos = getRepositories();
        const session = await repos.sessions.findById(sessionId);
        if (!session) {
            res.status(404).json({
                error: { code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.`, requestId: req.id },
            });
            return;
        }
        const offer = await repos.offers.findBySessionId(sessionId);
        if (!offer) {
            res.status(404).json({
                error: { code: 'OFFER_NOT_FOUND', message: `No offer exists for session ${sessionId}.`, requestId: req.id },
            });
            return;
        }
        // Verify state transition is permitted
        if (!canTransitionOffer(offer.status, 'merchant_confirmed')) {
            res.status(400).json({
                error: {
                    code: 'INVALID_STATE_TRANSITION',
                    message: `Cannot transition offer from "${offer.status}" to "merchant_confirmed".`,
                    requestId: req.id,
                },
            });
            return;
        }
        // Check that supporting verified evidence exists
        const evidenceList = await repos.evidence.findBySessionId(sessionId);
        const verifiedEvidence = evidenceList.filter((e) => e.verificationStatus === 'verified' || e.verificationStatus === 'partially_verified');
        if (verifiedEvidence.length === 0) {
            res.status(400).json({
                error: {
                    code: 'UNSUPPORTED_CONFIRMATION',
                    message: 'Cannot confirm merchant terms without supporting corroborated evidence.',
                    requestId: req.id,
                },
            });
            return;
        }
        const updatedOffer = await repos.offers.createOrUpdate({
            ...offer,
            status: 'merchant_confirmed',
            revision: offer.revision + 1,
        });
        eventBus.publish('merchant.confirmed', session.negotiationId, updatedOffer, sessionId, offer.id);
        res.json(updatedOffer);
    }
    catch (err) {
        next(err);
    }
}
export async function endSession(req, res, next) {
    try {
        const sessionId = getParam(req.params.id);
        const repos = getRepositories();
        const session = await repos.sessions.findById(sessionId);
        if (!session) {
            res.status(404).json({
                error: { code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.`, requestId: req.id },
            });
            return;
        }
        if (!canTransitionSession(session.status, 'ended')) {
            res.status(400).json({
                error: {
                    code: 'INVALID_SESSION_TRANSITION',
                    message: `Cannot transition session from "${session.status}" to "ended".`,
                    requestId: req.id,
                },
            });
            return;
        }
        const updatedSession = await repos.sessions.update(sessionId, {
            status: 'ended',
            endedAt: new Date().toISOString(),
        });
        eventBus.publish('session.ended', session.negotiationId, updatedSession, sessionId);
        res.json(updatedSession);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=internalAgentController.js.map