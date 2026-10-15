import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { SSEEventEnvelope, EventType } from '../../../../packages/shared/src/contracts.js';

interface SSEClient {
  id: string;
  res: Response;
  negotiationId: string;
}

class EventBus {
  private clients = new Map<string, SSEClient>();

  subscribe(negotiationId: string, res: Response): () => void {
    const clientId = uuidv4();
    const client: SSEClient = { id: clientId, res, negotiationId };
    this.clients.set(clientId, client);

    // Initial connection comment to establish SSE stream
    res.write(`: connected to negotiation ${negotiationId}\n\n`);

    // Heartbeat every 20s to prevent reverse-proxy timeout
    const heartbeat = setInterval(() => {
      try {
        res.write(`: ping ${new Date().toISOString()}\n\n`);
      } catch {
        clearInterval(heartbeat);
        this.clients.delete(clientId);
      }
    }, 20000);

    const unsubscribe = () => {
      clearInterval(heartbeat);
      this.clients.delete(clientId);
    };

    res.on('close', unsubscribe);
    res.on('error', unsubscribe);

    return unsubscribe;
  }

  publish<T>(type: EventType, negotiationId: string, data: T, sessionId?: string, offerId?: string): SSEEventEnvelope<T> {
    const envelope: SSEEventEnvelope<T> = {
      id: uuidv4(),
      type,
      negotiationId,
      sessionId,
      offerId,
      timestamp: new Date().toISOString(),
      data,
    };

    const payload = `id: ${envelope.id}\nevent: ${envelope.type}\ndata: ${JSON.stringify(envelope)}\n\n`;

    for (const [_, client] of this.clients) {
      if (client.negotiationId === negotiationId) {
        try {
          client.res.write(payload);
        } catch (err) {
          console.error(`Failed to push SSE to client ${client.id}:`, err);
        }
      }
    }

    return envelope;
  }

  getActiveClientCount(negotiationId?: string): number {
    if (!negotiationId) return this.clients.size;
    let count = 0;
    for (const [_, client] of this.clients) {
      if (client.negotiationId === negotiationId) count++;
    }
    return count;
  }
}

export const eventBus = new EventBus();
