import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  ObservationEventSchema,
  AuthorizeActionSchema,
} from '../../../../packages/shared/src/contracts.js';
import { getRepositories } from '../config/database.js';
import { eventBus } from '../events/eventBus.js';
import { validateEvidenceEvent } from '../policies/evidenceValidator.js';
import { evaluateNegotiationPolicy } from '../policies/negotiationGuard.js';
import { calculateLandedCost } from '../policies/costEngine.js';
import { canTransitionOffer, canTransitionSession } from '../policies/stateMachine.js';
import { getParam } from '../lib/params.js';

export async function getAgentNegotiationContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.negotiationId || req.params.id);
    const sessionId = getParam(req.params.sessionId);
    const repos = getRepositories();

    const negotiation = await repos.negotiations.findById(negotiationId);
    if (!negotiation) {
      res.status(404).json({
        error: { code: 'NEGOTIATION_NOT_FOUND', message: `Negotiation ${negotiationId} not found.`, requestId: req.id },
      });
      return;
    }

    const session = sessionId ? await repos.sessions.findById(sessionId) : null;
    const currentOffer = sessionId ? await repos.offers.findBySessionId(sessionId) : null;
    const evidenceList = sessionId ? await repos.evidence.findBySessionId(sessionId) : [];

    // Support both direct context and Friend C GetNegotiationContextOutput format
    if (req.params.sessionId) {
      res.json({
        mandate: {
          negotiationId: negotiation.id,
          objective: negotiation.objective,
          itemDescription: negotiation.objective,
          quantity: negotiation.quantity,
          targetPrice: negotiation.counterOfferPolicy.targetUnitPrice ?? Math.round(negotiation.maxBudget / negotiation.quantity),
          maxBudget: negotiation.maxBudget,
          currency: negotiation.currency,
          maxDeliveryDays: negotiation.deliveryDeadlineDays,
          minWarrantyMonths: negotiation.minWarrantyMonths,
          mandatorySpecifications: negotiation.mandatorySpecifications,
          counterOfferPolicy: {
            maxConcessionPercent: 10,
            concessionStepPercent: 2,
            targetSavingsPercent: 5,
            autoRejectAboveMaxBudget: true,
          },
          negotiationAuthority: 'ai_autonomous_with_guardrails',
          status: negotiation.status,
        },
        session: session || {
          sessionId: sessionId || 'default',
          negotiationId: negotiation.id,
          merchantName: 'Merchant Participant',
          merchantRole: 'sales_rep',
          status: 'active',
          startedAt: Date.now(),
        },
        currentOffer: currentOffer?.terms ? {
          unitPrice: currentOffer.terms.unitPrice ?? null,
          totalPrice: currentOffer.costBreakdown.totalLandedCost ?? null,
          quantity: currentOffer.terms.quantity ?? negotiation.quantity,
          currency: negotiation.currency,
          shippingCost: currentOffer.terms.shippingFee ?? null,
          isShippingIncluded: currentOffer.terms.isShippingIncluded ?? null,
          taxes: currentOffer.terms.taxRatePercent ?? null,
          warrantyMonths: currentOffer.terms.warrantyMonths ?? null,
          deliveryDays: currentOffer.terms.deliveryDays ?? null,
          paymentTerms: currentOffer.terms.paymentTerms ?? null,
          productSpecs: currentOffer.terms.specifications?.join(', ') ?? null,
          status: currentOffer.status,
        } : null,
        evidenceCount: evidenceList.length,
        roundsCompleted: currentOffer ? currentOffer.revision : 0,
        maxRounds: 10,
      });
      return;
    }

    // Default buyer/agent context
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
  } catch (err) {
    next(err);
  }
}

export async function ingestObservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = getParam(req.params.sessionId || req.params.id);
    const repos = getRepositories();

    // Adapter for Friend C payload format:
    // Friend C sends: { negotiationId, sessionId, sourceTurnId, timestampMs, speaker, sourceText, extractedTerms, idempotencyKey }
    let rawBody = { ...req.body };
    if (rawBody.idempotencyKey && !rawBody.eventId) {
      rawBody.eventId = rawBody.idempotencyKey;
    }
    if (rawBody.timestampMs && !rawBody.timestamp) {
      rawBody.timestamp = new Date(rawBody.timestampMs).toISOString();
    }
    // If extractedTerms is array of { key, value } (Friend C format), normalize to object
    if (Array.isArray(rawBody.extractedTerms)) {
      const normalizedTerms: any = {};
      for (const entry of rawBody.extractedTerms) {
        if (entry.key === 'unitPrice') normalizedTerms.unitPrice = Number(entry.value);
        if (entry.key === 'quantity') normalizedTerms.quantity = Number(entry.value);
        if (entry.key === 'shippingCost') normalizedTerms.shippingFee = Number(entry.value);
        if (entry.key === 'isShippingIncluded') normalizedTerms.isShippingIncluded = Boolean(entry.value);
        if (entry.key === 'warrantyMonths') normalizedTerms.warrantyMonths = Number(entry.value);
        if (entry.key === 'deliveryDays') normalizedTerms.deliveryDays = Number(entry.value);
      }
      rawBody.extractedTerms = normalizedTerms;
    }
    if (!rawBody.negotiationId) {
      const ses = await repos.sessions.findById(sessionId);
      if (ses) rawBody.negotiationId = ses.negotiationId;
    }
    if (!rawBody.sessionId) {
      rawBody.sessionId = sessionId;
    }
    if (rawBody.speaker === 'agent') {
      rawBody.speaker = 'ai_agent';
    }

    const input = ObservationEventSchema.parse(rawBody);

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
        success: true,
        eventId: existingEvidence.eventId,
        evidence: existingEvidence,
        isIdempotentReplay: true,
        message: 'Observation replayed (idempotent)',
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
    const supportingEvidenceIds = Array.from(
      new Set([...(existingOffer?.supportingEvidenceIds || []), evidenceId])
    );

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

    // Return shape compatible with both contracts
    res.status(201).json({
      success: true,
      eventId: evidenceRecord.eventId,
      offerStatus: updatedOffer.status,
      verificationStatus: evidenceRecord.verificationStatus,
      evidence: evidenceRecord,
      offer: updatedOffer,
      isIdempotentReplay: false,
      message: 'Observation recorded and validated',
    });
  } catch (err) {
    next(err);
  }
}

export async function authorizeAgentAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = getParam(req.params.sessionId || req.params.id);
    const repos = getRepositories();

    // Adapter for Friend C payload format
    let rawBody = { ...req.body };
    if (rawBody.proposedAction && !rawBody.actionType) {
      if (rawBody.proposedAction === 'counteroffer') rawBody.actionType = 'counter_offer';
      else if (rawBody.proposedAction === 'confirm') rawBody.actionType = 'confirm_merchant_offer';
      else rawBody.actionType = 'propose_offer';
    }
    if (!rawBody.proposedTerms) {
      rawBody.proposedTerms = {};
      if (rawBody.proposedUnitPrice) {
        rawBody.proposedTerms.unitPrice = rawBody.proposedUnitPrice;
      }
    }

    const input = AuthorizeActionSchema.parse(rawBody);

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

    // Return shape compatible with both contracts
    res.json({
      decision: {
        allowed: policyResult.isAllowed,
        action: policyResult.isAllowed ? 'counteroffer_permitted' : 'offer_rejected_by_policy',
        reason: policyResult.reason,
        unresolvedFields: policyResult.violations,
      },
      sessionId,
      revision: existingOffer ? existingOffer.revision : 1,
      ...policyResult,
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmMerchantOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = getParam(req.params.sessionId || req.params.id);
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

    res.json({
      success: true,
      confirmedTerms: ['unitPrice', 'quantity', 'shippingCost'],
      unresolvedTerms: [],
      offerStatus: updatedOffer.status,
      readyForReview: true,
      message: 'Offer successfully confirmed with evidence backing',
      ...updatedOffer,
    });
  } catch (err) {
    next(err);
  }
}

export async function endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = getParam(req.params.sessionId || req.params.id);
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
    res.json({
      success: true,
      sessionId,
      finalStatus: 'ended',
      message: 'Session closed successfully',
      ...updatedSession,
    });
  } catch (err) {
    next(err);
  }
}
