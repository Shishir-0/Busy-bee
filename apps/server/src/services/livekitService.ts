import { AccessToken } from 'livekit-server-sdk';
import { env } from '../config/env.js';
import type { LiveKitTokenResponse, SpeakerRole } from '../../../../packages/shared/src/contracts.js';

export async function createLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName?: string,
  role: SpeakerRole = 'merchant'
): Promise<LiveKitTokenResponse & { isLiveConfigured: boolean }> {
  const expiresInSeconds = 3600; // 1 hour short-lived token

  const isLiveConfigured = Boolean(
    env.LIVEKIT_API_KEY &&
    env.LIVEKIT_API_SECRET &&
    !env.LIVEKIT_API_KEY.includes('replace_with') &&
    !env.LIVEKIT_API_SECRET.includes('replace_with') &&
    env.LIVEKIT_URL &&
    !env.LIVEKIT_URL.includes('your-project')
  );

  if (isLiveConfigured) {
    const at = new AccessToken(env.LIVEKIT_API_KEY!, env.LIVEKIT_API_SECRET!, {
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
      isLiveConfigured: true,
    };
  }

  // Graceful simulation token when LiveKit keys are placeholders or not configured
  const mockToken = `sim_jwt_${Buffer.from(
    JSON.stringify({
      room: roomName,
      identity: participantIdentity,
      role,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  ).toString('base64')}`;

  return {
    token: mockToken,
    url: env.LIVEKIT_URL || 'wss://simulated.livekit.cloud',
    roomName,
    participantIdentity,
    expiresInSeconds,
    isLiveConfigured: false,
  };
}
