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

export class InMemoryNegotiationRepository implements INegotiationRepository {
  private store = new Map<string, NegotiationMandate>();

  async create(input: CreateNegotiationInput): Promise<NegotiationMandate> {
    const id = `neg-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const record: NegotiationMandate = {
      ...input,
      id,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id, record);
    return { ...record };
  }

  async findById(id: string): Promise<NegotiationMandate | null> {
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }

  async findAll(): Promise<NegotiationMandate[]> {
    return Array.from(this.store.values()).map((r) => ({ ...r }));
  }

  async update(id: string, updates: Partial<NegotiationMandate>): Promise<NegotiationMandate | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }
}

export class InMemorySessionRepository implements ISessionRepository {
  private store = new Map<string, MerchantSession>();

  async create(session: Omit<MerchantSession, 'createdAt' | 'updatedAt'>): Promise<MerchantSession> {
    const now = new Date().toISOString();
    const record: MerchantSession = {
      ...session,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(session.id, record);
    return { ...record };
  }

  async findById(id: string): Promise<MerchantSession | null> {
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }

  async findByNegotiationId(negotiationId: string): Promise<MerchantSession[]> {
    return Array.from(this.store.values())
      .filter((s) => s.negotiationId === negotiationId)
      .map((s) => ({ ...s }));
  }

  async update(id: string, updates: Partial<MerchantSession>): Promise<MerchantSession | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }
}

export class InMemoryOfferRepository implements IOfferRepository {
  private store = new Map<string, OfferRecord>();

  async createOrUpdate(offer: Omit<OfferRecord, 'createdAt' | 'updatedAt'>): Promise<OfferRecord> {
    const existing = this.store.get(offer.id);
    const now = new Date().toISOString();
    const record: OfferRecord = {
      ...offer,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };
    this.store.set(offer.id, record);
    return { ...record };
  }

  async findById(id: string): Promise<OfferRecord | null> {
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }

  async findBySessionId(sessionId: string): Promise<OfferRecord | null> {
    const found = Array.from(this.store.values()).find((o) => o.sessionId === sessionId);
    return found ? { ...found } : null;
  }

  async findByNegotiationId(negotiationId: string): Promise<OfferRecord[]> {
    return Array.from(this.store.values())
      .filter((o) => o.negotiationId === negotiationId)
      .map((o) => ({ ...o }));
  }
}

export class InMemoryEvidenceRepository implements IEvidenceRepository {
  private store = new Map<string, EvidenceRecord>();
  private eventIndex = new Map<string, string>(); // eventId -> id

  async create(evidence: Omit<EvidenceRecord, 'createdAt'>): Promise<EvidenceRecord> {
    // Idempotency check: if eventId already processed, return existing
    const existingId = this.eventIndex.get(evidence.eventId);
    if (existingId) {
      const existing = this.store.get(existingId);
      if (existing) return { ...existing };
    }

    const record: EvidenceRecord = {
      ...evidence,
      createdAt: new Date().toISOString(),
    };
    this.store.set(evidence.id, record);
    this.eventIndex.set(evidence.eventId, evidence.id);
    return { ...record };
  }

  async findByEventId(eventId: string): Promise<EvidenceRecord | null> {
    const id = this.eventIndex.get(eventId);
    if (!id) return null;
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }

  async findBySessionId(sessionId: string): Promise<EvidenceRecord[]> {
    return Array.from(this.store.values())
      .filter((e) => e.sessionId === sessionId)
      .map((e) => ({ ...e }));
  }

  async findByNegotiationId(negotiationId: string): Promise<EvidenceRecord[]> {
    return Array.from(this.store.values())
      .filter((e) => e.negotiationId === negotiationId)
      .map((e) => ({ ...e }));
  }
}

export class InMemoryRecommendationRepository implements IRecommendationRepository {
  private store = new Map<string, RecommendationRecord>(); // negotiationId -> record

  async save(rec: RecommendationRecord): Promise<RecommendationRecord> {
    this.store.set(rec.negotiationId, { ...rec });
    return { ...rec };
  }

  async findByNegotiationId(negotiationId: string): Promise<RecommendationRecord | null> {
    const found = this.store.get(negotiationId);
    return found ? { ...found } : null;
  }
}

export function createInMemoryRepositories(): DatabaseRepositories {
  return {
    negotiations: new InMemoryNegotiationRepository(),
    sessions: new InMemorySessionRepository(),
    offers: new InMemoryOfferRepository(),
    evidence: new InMemoryEvidenceRepository(),
    recommendations: new InMemoryRecommendationRepository(),
    isMongoActive: () => false,
  };
}
