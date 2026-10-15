import { v4 as uuidv4 } from 'uuid';
class EventBus {
    clients = new Map();
    subscribe(negotiationId, res) {
        const clientId = uuidv4();
        const client = { id: clientId, res, negotiationId };
        this.clients.set(clientId, client);
        // Initial connection comment to establish SSE stream
        res.write(`: connected to negotiation ${negotiationId}\n\n`);
        // Heartbeat every 20s to prevent reverse-proxy timeout
        const heartbeat = setInterval(() => {
            try {
                res.write(`: ping ${new Date().toISOString()}\n\n`);
            }
            catch {
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
    publish(type, negotiationId, data, sessionId, offerId) {
        const envelope = {
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
                }
                catch (err) {
                    console.error(`Failed to push SSE to client ${client.id}:`, err);
                }
            }
        }
        return envelope;
    }
    getActiveClientCount(negotiationId) {
        if (!negotiationId)
            return this.clients.size;
        let count = 0;
        for (const [_, client] of this.clients) {
            if (client.negotiationId === negotiationId)
                count++;
        }
        return count;
    }
}
export const eventBus = new EventBus();
//# sourceMappingURL=eventBus.js.map