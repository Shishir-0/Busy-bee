import { AccessToken } from 'livekit-server-sdk';
import { env } from '../config/env.js';
export async function createLiveKitToken(roomName, participantIdentity, participantName, role = 'merchant') {
    const expiresInSeconds = 3600; // 1 hour short-lived token
    if (env.LIVEKIT_API_KEY && env.LIVEKIT_API_SECRET) {
        const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
            identity: participantIdentity,
            name: participantName || participantIdentity,
            ttl: expiresInSeconds,
            metadata: JSON.stringify({ role }),
        });
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });
        const token = await at.toJwt();
        return {
            token,
            url: env.LIVEKIT_URL || 'wss://livekit.cloud',
            roomName,
            participantIdentity,
            expiresInSeconds,
        };
    }
    // Graceful simulation token when LiveKit keys are not set in environment
    const mockToken = `sim_jwt_${Buffer.from(JSON.stringify({
        room: roomName,
        identity: participantIdentity,
        role,
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })).toString('base64')}`;
    return {
        token: mockToken,
        url: env.LIVEKIT_URL || 'ws://localhost:7880',
        roomName,
        participantIdentity,
        expiresInSeconds,
    };
}
//# sourceMappingURL=livekitService.js.map