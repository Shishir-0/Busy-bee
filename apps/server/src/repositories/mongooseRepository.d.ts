import type { NegotiationMandate, MerchantSession, OfferRecord, EvidenceRecord, RecommendationRecord, CreateNegotiationInput } from '../../../../packages/shared/src/contracts.js';
import type { INegotiationRepository, ISessionRepository, IOfferRepository, IEvidenceRepository, IRecommendationRepository, DatabaseRepositories } from './types.js';
export declare class MongooseNegotiationRepository implements INegotiationRepository {
    create(input: CreateNegotiationInput): Promise<NegotiationMandate>;
    findById(id: string): Promise<NegotiationMandate | null>;
    findAll(): Promise<NegotiationMandate[]>;
    update(id: string, updates: Partial<NegotiationMandate>): Promise<NegotiationMandate | null>;
}
export declare class MongooseSessionRepository implements ISessionRepository {
    create(session: Omit<MerchantSession, 'createdAt' | 'updatedAt'>): Promise<MerchantSession>;
    findById(id: string): Promise<MerchantSession | null>;
    findByNegotiationId(negotiationId: string): Promise<MerchantSession[]>;
    update(id: string, updates: Partial<MerchantSession>): Promise<MerchantSession | null>;
}
export declare class MongooseOfferRepository implements IOfferRepository {
    createOrUpdate(offer: Omit<OfferRecord, 'createdAt' | 'updatedAt'>): Promise<OfferRecord>;
    findById(id: string): Promise<OfferRecord | null>;
    findBySessionId(sessionId: string): Promise<OfferRecord | null>;
    findByNegotiationId(negotiationId: string): Promise<OfferRecord[]>;
}
export declare class MongooseEvidenceRepository implements IEvidenceRepository {
    create(evidence: Omit<EvidenceRecord, 'createdAt'>): Promise<EvidenceRecord>;
    findByEventId(eventId: string): Promise<EvidenceRecord | null>;
    findBySessionId(sessionId: string): Promise<EvidenceRecord[]>;
    findByNegotiationId(negotiationId: string): Promise<EvidenceRecord[]>;
}
export declare class MongooseRecommendationRepository implements IRecommendationRepository {
    save(rec: RecommendationRecord): Promise<RecommendationRecord>;
    findByNegotiationId(negotiationId: string): Promise<RecommendationRecord | null>;
}
export declare function createMongooseRepositories(): DatabaseRepositories;
//# sourceMappingURL=mongooseRepository.d.ts.map