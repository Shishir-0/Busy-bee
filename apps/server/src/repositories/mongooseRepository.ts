import { v4 as uuidv4 } from 'uuid';
import type {
  NegotiationMandate,
  MerchantSession,
  OfferRecord,
  EvidenceRecord,
  RecommendationRecord,
  CreateNegotiationInput,
} from '../../../../packages/shared/src/contracts.js';
import type {
  INegotiationRepository,
  ISessionRepository,
  IOfferRepository,
  IEvidenceRepository,
  IRecommendationRepository,
  DatabaseRepositories,
} from './types.js';
import {
  NegotiationModel,
  SessionModel,
  OfferModel,
  EvidenceModel,
  RecommendationModel,
} from '../models/schemas.js';

export class MongooseNegotiationRepository implements INegotiationRepository {
  async create(input: CreateNegotiationInput): Promise<NegotiationMandate> {
    const id = `neg-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const doc: any = await NegotiationModel.create({
      ...input,
      id,
      status: 'active',
    });
    return {
      ...input,
      id,
      status: 'active',
      createdAt: doc.createdAt?.toISOString() ?? now,
      updatedAt: doc.updatedAt?.toISOString() ?? now,
    };
  }

  async findById(id: string): Promise<NegotiationMandate | null> {
    const doc: any = await NegotiationModel.findOne({ id }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      objective: doc.objective,
      quantity: doc.quantity,
      currency: doc.currency,
      maxBudget: doc.maxBudget,
      deliveryDeadlineDays: doc.deliveryDeadlineDays,
      minWarrantyMonths: doc.minWarrantyMonths,
      mandatorySpecifications: doc.mandatorySpecifications,
      counterOfferPolicy: doc.counterOfferPolicy,
      status: doc.status,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    };
  }

  async findAll(): Promise<NegotiationMandate[]> {
    const docs: any[] = await NegotiationModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      objective: doc.objective,
      quantity: doc.quantity,
      currency: doc.currency,
      maxBudget: doc.maxBudget,
      deliveryDeadlineDays: doc.deliveryDeadlineDays,
      minWarrantyMonths: doc.minWarrantyMonths,
      mandatorySpecifications: doc.mandatorySpecifications,
      counterOfferPolicy: doc.counterOfferPolicy,
      status: doc.status,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    }));
  }

  async update(id: string, updates: Partial<NegotiationMandate>): Promise<NegotiationMandate | null> {
    await NegotiationModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
    return this.findById(id);
  }
}

export class MongooseSessionRepository implements ISessionRepository {
  async create(session: Omit<MerchantSession, 'createdAt' | 'updatedAt'>): Promise<MerchantSession> {
    const doc: any = await SessionModel.create(session);
    return {
      ...session,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async findById(id: string): Promise<MerchantSession | null> {
    const doc: any = await SessionModel.findOne({ id }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      negotiationId: doc.negotiationId,
      merchantName: doc.merchantName,
      merchantRole: doc.merchantRole,
      roomId: doc.roomId,
      status: doc.status,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    };
  }

  async findByNegotiationId(negotiationId: string): Promise<MerchantSession[]> {
    const docs: any[] = await SessionModel.find({ negotiationId }).sort({ createdAt: 1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      negotiationId: doc.negotiationId,
      merchantName: doc.merchantName,
      merchantRole: doc.merchantRole,
      roomId: doc.roomId,
      status: doc.status,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    }));
  }

  async update(id: string, updates: Partial<MerchantSession>): Promise<MerchantSession | null> {
    await SessionModel.findOneAndUpdate({ id }, { $set: updates });
    return this.findById(id);
  }
}

export class MongooseOfferRepository implements IOfferRepository {
  async createOrUpdate(offer: Omit<OfferRecord, 'createdAt' | 'updatedAt'>): Promise<OfferRecord> {
    const doc: any = await OfferModel.findOneAndUpdate(
      { id: offer.id },
      { $set: offer },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return {
      ...offer,
      createdAt: doc?.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  async findById(id: string): Promise<OfferRecord | null> {
    const doc: any = await OfferModel.findOne({ id }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      negotiationId: doc.negotiationId,
      sessionId: doc.sessionId,
      merchantName: doc.merchantName,
      revision: doc.revision,
      status: doc.status,
      terms: doc.terms,
      costBreakdown: doc.costBreakdown,
      supportingEvidenceIds: doc.supportingEvidenceIds,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    };
  }

  async findBySessionId(sessionId: string): Promise<OfferRecord | null> {
    const doc: any = await OfferModel.findOne({ sessionId }).lean();
    if (!doc) return null;
    return this.findById(doc.id);
  }

  async findByNegotiationId(negotiationId: string): Promise<OfferRecord[]> {
    const docs: any[] = await OfferModel.find({ negotiationId }).sort({ revision: -1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      negotiationId: doc.negotiationId,
      sessionId: doc.sessionId,
      merchantName: doc.merchantName,
      revision: doc.revision,
      status: doc.status,
      terms: doc.terms,
      costBreakdown: doc.costBreakdown,
      supportingEvidenceIds: doc.supportingEvidenceIds,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    }));
  }
}

export class MongooseEvidenceRepository implements IEvidenceRepository {
  async create(evidence: Omit<EvidenceRecord, 'createdAt'>): Promise<EvidenceRecord> {
    // Idempotency: find if eventId exists
    const existing: any = await EvidenceModel.findOne({ eventId: evidence.eventId }).lean();
    if (existing) {
      return {
        id: existing.id,
        eventId: existing.eventId,
        negotiationId: existing.negotiationId,
        sessionId: existing.sessionId,
        sourceTurnId: existing.sourceTurnId,
        timestamp: existing.timestamp,
        speaker: existing.speaker,
        sourceText: existing.sourceText,
        extractedTerms: existing.extractedTerms,
        verificationStatus: existing.verificationStatus,
        verificationReason: existing.verificationReason,
        createdAt: existing.createdAt ? new Date(existing.createdAt).toISOString() : '',
      };
    }

    const doc: any = await EvidenceModel.create(evidence);
    return {
      ...evidence,
      createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async findByEventId(eventId: string): Promise<EvidenceRecord | null> {
    const doc: any = await EvidenceModel.findOne({ eventId }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      eventId: doc.eventId,
      negotiationId: doc.negotiationId,
      sessionId: doc.sessionId,
      sourceTurnId: doc.sourceTurnId,
      timestamp: doc.timestamp,
      speaker: doc.speaker,
      sourceText: doc.sourceText,
      extractedTerms: doc.extractedTerms,
      verificationStatus: doc.verificationStatus,
      verificationReason: doc.verificationReason,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    };
  }

  async findBySessionId(sessionId: string): Promise<EvidenceRecord[]> {
    const docs: any[] = await EvidenceModel.find({ sessionId }).sort({ createdAt: 1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      eventId: doc.eventId,
      negotiationId: doc.negotiationId,
      sessionId: doc.sessionId,
      sourceTurnId: doc.sourceTurnId,
      timestamp: doc.timestamp,
      speaker: doc.speaker,
      sourceText: doc.sourceText,
      extractedTerms: doc.extractedTerms,
      verificationStatus: doc.verificationStatus,
      verificationReason: doc.verificationReason,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    }));
  }

  async findByNegotiationId(negotiationId: string): Promise<EvidenceRecord[]> {
    const docs: any[] = await EvidenceModel.find({ negotiationId }).sort({ createdAt: 1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      eventId: doc.eventId,
      negotiationId: doc.negotiationId,
      sessionId: doc.sessionId,
      sourceTurnId: doc.sourceTurnId,
      timestamp: doc.timestamp,
      speaker: doc.speaker,
      sourceText: doc.sourceText,
      extractedTerms: doc.extractedTerms,
      verificationStatus: doc.verificationStatus,
      verificationReason: doc.verificationReason,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    }));
  }
}

export class MongooseRecommendationRepository implements IRecommendationRepository {
  async save(rec: RecommendationRecord): Promise<RecommendationRecord> {
    await RecommendationModel.findOneAndUpdate(
      { negotiationId: rec.negotiationId },
      { $set: rec },
      { upsert: true, new: true }
    );
    return { ...rec };
  }

  async findByNegotiationId(negotiationId: string): Promise<RecommendationRecord | null> {
    const doc: any = await RecommendationModel.findOne({ negotiationId }).lean();
    if (!doc) return null;
    return {
      id: doc.id,
      negotiationId: doc.negotiationId,
      status: doc.status,
      winnerOfferId: doc.winnerOfferId,
      winnerMerchantName: doc.winnerMerchantName,
      eligibleOffers: doc.eligibleOffers,
      ineligibleOffers: doc.ineligibleOffers,
      unresolvedConditions: doc.unresolvedConditions,
      formulaExplanation: doc.formulaExplanation,
      calculatedAt: doc.calculatedAt,
    };
  }
}

export function createMongooseRepositories(): DatabaseRepositories {
  return {
    negotiations: new MongooseNegotiationRepository(),
    sessions: new MongooseSessionRepository(),
    offers: new MongooseOfferRepository(),
    evidence: new MongooseEvidenceRepository(),
    recommendations: new MongooseRecommendationRepository(),
    isMongoActive: () => true,
  };
}
