import { Response } from 'express';
import type { SSEEventEnvelope, EventType } from '../../../../packages/shared/src/contracts.js';
declare class EventBus {
    private clients;
    subscribe(negotiationId: string, res: Response): () => void;
    publish<T>(type: EventType, negotiationId: string, data: T, sessionId?: string, offerId?: string): SSEEventEnvelope<T>;
    getActiveClientCount(negotiationId?: string): number;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=eventBus.d.ts.map