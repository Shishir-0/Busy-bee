import type { NegotiationMandate, MerchantSession, OfferRecord, EvidenceRecord, RecommendationRecord, CreateNegotiationInput } from '../../../../packages/shared/src/contracts.js';
import type { INegotiationRepository, ISessionRepository, IOfferRepository, IEvidenceRepository, IRecommendationRepository, DatabaseRepositories } from './types.js';
export declare class InMemoryNegotiationRepository implements INegotiationRepository {
    private store;
    create(input: CreateNegotiationInput): Promise<NegotiationMandate>;
    findById(id: string): Promise<NegotiationMandate | null>;
    findAll(): Promise<NegotiationMandate[]>;
    update(id: string, updates: Partial<NegotiationMandate>): Promise<NegotiationMandate | null>;
}
export declare class InMemorySessionRepository implements ISessionRepository {
    private store;
    create(session: Omit<MerchantSession, 'createdAt' | 'updatedAt'>): Promise<MerchantSession>;
    findById(id: string): Promise<MerchantSession | null>;
    findByNegotiationId(negotiationId: string): Promise<MerchantSession[]>;
    update(id: string, updates: Partial<MerchantSession>): Promise<MerchantSession | null>;
}
export declare class InMemoryOfferRepository implements IOfferRepository {
    private store;
    createOrUpdate(offer: Omit<OfferRecord, 'createdAt' | 'updatedAt'>): Promise<OfferRecord>;
    findById(id: string): Promise<OfferRecord | null>;
    findBySessionId(sessionId: string): Promise<OfferRecord | null>;
    findByNegotiationId(negotiationId: string): Promise<OfferRecord[]>;
}
export declare class InMemoryEvidenceRepository implements IEvidenceRepository {
    private store;
    private eventIndex;
    create(evidence: Omit<EvidenceRecord, 'createdAt'>): Promise<EvidenceRecord>;
    findByEventId(eventId: string): Promise<EvidenceRecord | null>;
    findBySessionId(sessionId: string): Promise<EvidenceRecord[]>;
    findByNegotiationId(negotiationId: string): Promise<EvidenceRecord[]>;
}
export declare class InMemoryRecommendationRepository implements IRecommendationRepository {
    private store;
    save(rec: RecommendationRecord): Promise<RecommendationRecord>;
    findByNegotiationId(negotiationId: string): Promise<RecommendationRecord | null>;
}
export declare function createInMemoryRepositories(): DatabaseRepositories;
//# sourceMappingURL=inMemoryRepository.d.ts.map