import { v4 as uuidv4 } from 'uuid';
import { NegotiationModel, SessionModel, OfferModel, EvidenceModel, RecommendationModel, } from '../models/schemas.js';
export class MongooseNegotiationRepository {
    async create(input) {
        const id = `neg-${uuidv4().slice(0, 8)}`;
        const now = new Date().toISOString();
        const doc = await NegotiationModel.create({
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
    async findById(id) {
        const doc = await NegotiationModel.findOne({ id }).lean();
        if (!doc)
            return null;
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
    async findAll() {
        const docs = await NegotiationModel.find().sort({ createdAt: -1 }).lean();
        return docs.map((doc) => ({
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
    async update(id, updates) {
        await NegotiationModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        return this.findById(id);
    }
}
export class MongooseSessionRepository {
    async create(session) {
        const doc = await SessionModel.create(session);
        return {
            ...session,
            createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
        };
    }
    async findById(id) {
        const doc = await SessionModel.findOne({ id }).lean();
        if (!doc)
            return null;
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
    async findByNegotiationId(negotiationId) {
        const docs = await SessionModel.find({ negotiationId }).sort({ createdAt: 1 }).lean();
        return docs.map((doc) => ({
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
    async update(id, updates) {
        await SessionModel.findOneAndUpdate({ id }, { $set: updates });
        return this.findById(id);
    }
}
export class MongooseOfferRepository {
    async createOrUpdate(offer) {
        const doc = await OfferModel.findOneAndUpdate({ id: offer.id }, { $set: offer }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
        return {
            ...offer,
            createdAt: doc?.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        };
    }
    async findById(id) {
        const doc = await OfferModel.findOne({ id }).lean();
        if (!doc)
            return null;
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
    async findBySessionId(sessionId) {
        const doc = await OfferModel.findOne({ sessionId }).lean();
        if (!doc)
            return null;
        return this.findById(doc.id);
    }
    async findByNegotiationId(negotiationId) {
        const docs = await OfferModel.find({ negotiationId }).sort({ revision: -1 }).lean();
        return docs.map((doc) => ({
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
export class MongooseEvidenceRepository {
    async create(evidence) {
        // Idempotency: find if eventId exists
        const existing = await EvidenceModel.findOne({ eventId: evidence.eventId }).lean();
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
        const doc = await EvidenceModel.create(evidence);
        return {
            ...evidence,
            createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
        };
    }
    async findByEventId(eventId) {
        const doc = await EvidenceModel.findOne({ eventId }).lean();
        if (!doc)
            return null;
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
    async findBySessionId(sessionId) {
        const docs = await EvidenceModel.find({ sessionId }).sort({ createdAt: 1 }).lean();
        return docs.map((doc) => ({
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
    async findByNegotiationId(negotiationId) {
        const docs = await EvidenceModel.find({ negotiationId }).sort({ createdAt: 1 }).lean();
        return docs.map((doc) => ({
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
export class MongooseRecommendationRepository {
    async save(rec) {
        await RecommendationModel.findOneAndUpdate({ negotiationId: rec.negotiationId }, { $set: rec }, { upsert: true, new: true });
        return { ...rec };
    }
    async findByNegotiationId(negotiationId) {
        const doc = await RecommendationModel.findOne({ negotiationId }).lean();
        if (!doc)
            return null;
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
export function createMongooseRepositories() {
    return {
        negotiations: new MongooseNegotiationRepository(),
        sessions: new MongooseSessionRepository(),
        offers: new MongooseOfferRepository(),
        evidence: new MongooseEvidenceRepository(),
        recommendations: new MongooseRecommendationRepository(),
        isMongoActive: () => true,
    };
}
//# sourceMappingURL=mongooseRepository.js.map