import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateNegotiationSchema,
  CreateSessionSchema,
  LiveKitTokenRequestSchema,
} from '../../../../packages/shared/src/contracts.js';
import { getRepositories } from '../config/database.js';
import { eventBus } from '../events/eventBus.js';
import { createLiveKitToken } from '../services/livekitService.js';
import { evaluateRecommendation } from '../policies/recommendationEngine.js';
import { getParam } from '../lib/params.js';

export async function createNegotiation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = CreateNegotiationSchema.parse(req.body);
    const repos = getRepositories();
    const negotiation = await repos.negotiations.create(input);

    eventBus.publish('negotiation.created', negotiation.id, negotiation);
    res.status(201).json(negotiation);
  } catch (err) {
    next(err);
  }
}

export async function listNegotiations(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const repos = getRepositories();
    const list = await repos.negotiations.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getNegotiation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const repos = getRepositories();
    const negotiation = await repos.negotiations.findById(id);

    if (!negotiation) {
      res.status(404).json({
        error: { code: 'NEGOTIATION_NOT_FOUND', message: `Negotiation ${id} does not exist.`, requestId: req.id },
      });
      return;
    }

    res.json(negotiation);
  } catch (err) {
    next(err);
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const input = CreateSessionSchema.parse(req.body);
    const repos = getRepositories();

    const negotiation = await repos.negotiations.findById(negotiationId);
    if (!negotiation) {
      res.status(404).json({
        error: { code: 'NEGOTIATION_NOT_FOUND', message: `Negotiation ${negotiationId} not found.`, requestId: req.id },
      });
      return;
    }

    // Check for existing active session for this merchant
    const existingSessions = await repos.sessions.findByNegotiationId(negotiationId);
    const duplicateActive = existingSessions.find(
      (s) => s.merchantName.toLowerCase() === input.merchantName.toLowerCase() && (s.status === 'active' || s.status === 'connecting')
    );

    if (duplicateActive) {
      res.status(409).json({
        error: {
          code: 'DUPLICATE_ACTIVE_SESSION',
          message: `Active session already exists for merchant "${input.merchantName}".`,
          requestId: req.id,
        },
      });
      return;
    }

    const sessionId = `ses-${uuidv4().slice(0, 8)}`;
    const roomId = `room-${negotiationId}-${sessionId}`;

    const session = await repos.sessions.create({
      id: sessionId,
      negotiationId,
      merchantName: input.merchantName,
      merchantRole: input.merchantRole,
      roomId,
      status: 'active', // starts active for direct WebRTC entry
      startedAt: new Date().toISOString(),
    });

    eventBus.publish('session.started', negotiationId, session, sessionId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function issueSessionToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = getParam(req.params.id);
    const input = LiveKitTokenRequestSchema.parse(req.body);
    const repos = getRepositories();

    const session = await repos.sessions.findById(sessionId);
    if (!session) {
      res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: `Session ${sessionId} not found.`, requestId: req.id },
      });
      return;
    }

    const tokenResponse = await createLiveKitToken(
      session.roomId,
      input.participantIdentity,
      input.participantName,
      input.role
    );

    res.json(tokenResponse);
  } catch (err) {
    next(err);
  }
}

export async function getNegotiationOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const offers = await repos.offers.findByNegotiationId(negotiationId);
    res.json(offers);
  } catch (err) {
    next(err);
  }
}

export async function getNegotiationEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const repos = getRepositories();

    const evidenceList = await repos.evidence.findByNegotiationId(negotiationId);
    res.json(evidenceList);
  } catch (err) {
    next(err);
  }
}

export async function calculateRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const offers = await repos.offers.findByNegotiationId(negotiationId);
    const evidenceList = await repos.evidence.findByNegotiationId(negotiationId);

    const recommendation = evaluateRecommendation(negotiation, offers, evidenceList);
    await repos.recommendations.save(recommendation);

    eventBus.publish('recommendation.calculated', negotiationId, recommendation);
    res.json(recommendation);
  } catch (err) {
    next(err);
  }
}

export async function listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const repos = getRepositories();
    const sessions = await repos.sessions.findByNegotiationId(negotiationId);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function getNegotiationViolations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const repos = getRepositories();
    const offers = await repos.offers.findByNegotiationId(negotiationId);
    const violations = offers.flatMap((o) => (o as any).policyViolations || []);
    res.json(violations);
  } catch (err) {
    next(err);
  }
}

export async function getRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const repos = getRepositories();
    const recommendation = await repos.recommendations.findByNegotiationId(negotiationId);
    if (!recommendation) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No recommendation found' } });
      return;
    }
    res.json(recommendation);
  } catch (err) {
    next(err);
  }
}

export async function approveRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const negotiationId = getParam(req.params.id);
    const { reviewedBy, comments } = req.body || {};
    const repos = getRepositories();
    let recommendation = await repos.recommendations.findByNegotiationId(negotiationId);
    if (!recommendation) {
      const negotiation = await repos.negotiations.findById(negotiationId);
      if (!negotiation) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Negotiation not found' } });
        return;
      }
      const offers = await repos.offers.findByNegotiationId(negotiationId);
      const evidence = await repos.evidence.findByNegotiationId(negotiationId);
      recommendation = evaluateRecommendation(negotiation, offers, evidence);
    }
    recommendation.status = 'approved';
    (recommendation as any).buyerReviewAction = {
      reviewedBy: reviewedBy || 'Authorized Buyer',
      approvedAt: new Date().toISOString(),
      comments: comments || 'Approved terms',
    };
    await repos.recommendations.save(recommendation);
    eventBus.publish('recommendation.approved', negotiationId, recommendation);
    res.json(recommendation);
  } catch (err) {
    next(err);
  }
}

export function streamNegotiationEvents(req: Request, res: Response): void {
  const negotiationId = getParam(req.params.id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  eventBus.subscribe(negotiationId, res);
}
