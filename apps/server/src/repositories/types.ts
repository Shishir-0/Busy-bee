import type {
  NegotiationMandate,
  MerchantSession,
  OfferRecord,
  EvidenceRecord,
  RecommendationRecord,
  CreateNegotiationInput,
} from '../../../../packages/shared/src/contracts.js';

export interface INegotiationRepository {
  create(input: CreateNegotiationInput): Promise<NegotiationMandate>;
  findById(id: string): Promise<NegotiationMandate | null>;
  findAll(): Promise<NegotiationMandate[]>;
  update(id: string, updates: Partial<NegotiationMandate>): Promise<NegotiationMandate | null>;
}

export interface ISessionRepository {
  create(session: Omit<MerchantSession, 'createdAt' | 'updatedAt'>): Promise<MerchantSession>;
  findById(id: string): Promise<MerchantSession | null>;
  findByNegotiationId(negotiationId: string): Promise<MerchantSession[]>;
  update(id: string, updates: Partial<MerchantSession>): Promise<MerchantSession | null>;
}

export interface IOfferRepository {
  createOrUpdate(offer: Omit<OfferRecord, 'createdAt' | 'updatedAt'>): Promise<OfferRecord>;
  findById(id: string): Promise<OfferRecord | null>;
  findBySessionId(sessionId: string): Promise<OfferRecord | null>;
  findByNegotiationId(negotiationId: string): Promise<OfferRecord[]>;
}

export interface IEvidenceRepository {
  create(evidence: Omit<EvidenceRecord, 'createdAt'>): Promise<EvidenceRecord>;
  findByEventId(eventId: string): Promise<EvidenceRecord | null>;
  findBySessionId(sessionId: string): Promise<EvidenceRecord[]>;
  findByNegotiationId(negotiationId: string): Promise<EvidenceRecord[]>;
}

export interface IRecommendationRepository {
  save(rec: RecommendationRecord): Promise<RecommendationRecord>;
  findByNegotiationId(negotiationId: string): Promise<RecommendationRecord | null>;
}

export interface DatabaseRepositories {
  negotiations: INegotiationRepository;
  sessions: ISessionRepository;
  offers: IOfferRepository;
  evidence: IEvidenceRepository;
  recommendations: IRecommendationRepository;
  isMongoActive(): boolean;
}
