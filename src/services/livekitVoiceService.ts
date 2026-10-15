/**
 * The Negotiator • LiveKit Browser WebRTC Voice Service
 * Handles browser microphone capture, LiveKit room connection,
 * remote agent audio track subscription, and active speaker visualizer integration.
 */

import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  createLocalAudioTrack,
  LocalAudioTrack,
} from 'livekit-client';

export interface VoiceSessionConfig {
  url: string;
  token: string;
  isLiveConfigured?: boolean;
  onActiveSpeakerChange?: (speaker: 'agent' | 'merchant' | 'idle') => void;
  onConnectionStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'error', error?: string) => void;
  onTranscriptReceived?: (turn: { speaker: 'agent' | 'merchant'; text: string }) => void;
}

export class LiveKitVoiceClient {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
      document.body.appendChild(this.audioElement);
    }
  }

  public async connect(config: VoiceSessionConfig): Promise<boolean> {
    config.onConnectionStatusChange?.('connecting');

    // 1. Check if token or URL is simulation mode
    if (!config.isLiveConfigured || config.url.includes('simulated') || config.token.startsWith('sim_jwt_') || config.token.startsWith('sim-token')) {
      console.warn('[LiveKitVoiceClient] LiveKit Cloud credentials are placeholders or simulated.');
      config.onConnectionStatusChange?.(
        'connected',
        'Demonstration mode: Using browser simulation audio. Configure valid LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET for cloud WebRTC routing.'
      );
      return false;
    }

    try {
      // 2. Request browser microphone access and create audio track
      this.localAudioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      // 3. Create LiveKit WebRTC room instance
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // 4. Handle incoming remote audio tracks (Agent speech)
      this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio && this.audioElement) {
          console.log('[LiveKitVoiceClient] Remote agent audio track subscribed. Attaching to audio element.');
          track.attach(this.audioElement);
          config.onActiveSpeakerChange?.('agent');
        }
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio && this.audioElement) {
          track.detach(this.audioElement);
          config.onActiveSpeakerChange?.('idle');
        }
      });

      // 5. Active speaker monitoring
      this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (!speakers || speakers.length === 0) {
          config.onActiveSpeakerChange?.('idle');
          return;
        }
        const hasAgent = speakers.some((s) => s.identity.includes('agent'));
        if (hasAgent) {
          config.onActiveSpeakerChange?.('agent');
        } else {
          config.onActiveSpeakerChange?.('merchant');
        }
      });

      // 6. Handle data packets (live transcript events from agent)
      this.room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const str = new TextDecoder().decode(payload);
          const data = JSON.parse(str);
          if (data.type === 'transcript' && config.onTranscriptReceived) {
            config.onTranscriptReceived({
              speaker: data.speaker === 'agent' ? 'agent' : 'merchant',
              text: data.text,
            });
          }
        } catch (e) {
          // ignore non-json data
        }
      });

      // 7. Connect to LiveKit server
      await this.room.connect(config.url, config.token);
      console.log(`[LiveKitVoiceClient] Connected to room: ${this.room.name}`);

      // 8. Publish local microphone track
      if (this.localAudioTrack) {
        await this.room.localParticipant.publishTrack(this.localAudioTrack);
        console.log('[LiveKitVoiceClient] Microphone audio published to room.');
      }

      config.onConnectionStatusChange?.('connected');
      return true;
    } catch (err: any) {
      console.warn('[LiveKitVoiceClient] Connection failed:', err?.message || err);
      config.onConnectionStatusChange?.('error', err?.message || 'Failed to connect to LiveKit room.');
      this.disconnect();
      return false;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.localAudioTrack) {
      if (muted) {
        this.localAudioTrack.mute();
      } else {
        this.localAudioTrack.unmute();
      }
    }
  }

  public disconnect(): void {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.audioElement) {
      this.audioElement.srcObject = null;
    }
  }
}

export const livekitVoiceService = new LiveKitVoiceClient();
