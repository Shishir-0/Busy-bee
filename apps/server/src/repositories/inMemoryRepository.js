import { v4 as uuidv4 } from 'uuid';
export class InMemoryNegotiationRepository {
    store = new Map();
    async create(input) {
        const id = `neg-${uuidv4().slice(0, 8)}`;
        const now = new Date().toISOString();
        const record = {
            ...input,
            id,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        };
        this.store.set(id, record);
        return { ...record };
    }
    async findById(id) {
        const found = this.store.get(id);
        return found ? { ...found } : null;
    }
    async findAll() {
        return Array.from(this.store.values()).map((r) => ({ ...r }));
    }
    async update(id, updates) {
        const existing = this.store.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.store.set(id, updated);
        return { ...updated };
    }
}
export class InMemorySessionRepository {
    store = new Map();
    async create(session) {
        const now = new Date().toISOString();
        const record = {
            ...session,
            createdAt: now,
            updatedAt: now,
        };
        this.store.set(session.id, record);
        return { ...record };
    }
    async findById(id) {
        const found = this.store.get(id);
        return found ? { ...found } : null;
    }
    async findByNegotiationId(negotiationId) {
        return Array.from(this.store.values())
            .filter((s) => s.negotiationId === negotiationId)
            .map((s) => ({ ...s }));
    }
    async update(id, updates) {
        const existing = this.store.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.store.set(id, updated);
        return { ...updated };
    }
}
export class InMemoryOfferRepository {
    store = new Map();
    async createOrUpdate(offer) {
        const existing = this.store.get(offer.id);
        const now = new Date().toISOString();
        const record = {
            ...offer,
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
        };
        this.store.set(offer.id, record);
        return { ...record };
    }
    async findById(id) {
        const found = this.store.get(id);
        return found ? { ...found } : null;
    }
    async findBySessionId(sessionId) {
        const found = Array.from(this.store.values()).find((o) => o.sessionId === sessionId);
        return found ? { ...found } : null;
    }
    async findByNegotiationId(negotiationId) {
        return Array.from(this.store.values())
            .filter((o) => o.negotiationId === negotiationId)
            .map((o) => ({ ...o }));
    }
}
export class InMemoryEvidenceRepository {
    store = new Map();
    eventIndex = new Map(); // eventId -> id
    async create(evidence) {
        // Idempotency check: if eventId already processed, return existing
        const existingId = this.eventIndex.get(evidence.eventId);
        if (existingId) {
            const existing = this.store.get(existingId);
            if (existing)
                return { ...existing };
        }
        const record = {
            ...evidence,
            createdAt: new Date().toISOString(),
        };
        this.store.set(evidence.id, record);
        this.eventIndex.set(evidence.eventId, evidence.id);
        return { ...record };
    }
    async findByEventId(eventId) {
        const id = this.eventIndex.get(eventId);
        if (!id)
            return null;
        const found = this.store.get(id);
        return found ? { ...found } : null;
    }
    async findBySessionId(sessionId) {
        return Array.from(this.store.values())
            .filter((e) => e.sessionId === sessionId)
            .map((e) => ({ ...e }));
    }
    async findByNegotiationId(negotiationId) {
        return Array.from(this.store.values())
            .filter((e) => e.negotiationId === negotiationId)
            .map((e) => ({ ...e }));
    }
}
export class InMemoryRecommendationRepository {
    store = new Map(); // negotiationId -> record
    async save(rec) {
        this.store.set(rec.negotiationId, { ...rec });
        return { ...rec };
    }
    async findByNegotiationId(negotiationId) {
        const found = this.store.get(negotiationId);
        return found ? { ...found } : null;
    }
}
export function createInMemoryRepositories() {
    return {
        negotiations: new InMemoryNegotiationRepository(),
        sessions: new InMemorySessionRepository(),
        offers: new InMemoryOfferRepository(),
        evidence: new InMemoryEvidenceRepository(),
        recommendations: new InMemoryRecommendationRepository(),
        isMongoActive: () => false,
    };
}
//# sourceMappingURL=inMemoryRepository.js.map