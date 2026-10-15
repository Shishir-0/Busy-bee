/**
 * The Negotiator • Central API Client
 * Supports both Live Express/MongoDB backend and Deterministic Simulation Provider
 */

import {
  NegotiationMandate,
  MerchantSession,
  MerchantOffer,
  EvidenceItem,
  PolicyViolation,
  DealRecommendation,
  TranscriptTurn,
} from '../types/negotiation';

import {
  INITIAL_MANDATE,
  INITIAL_SESSIONS,
  INITIAL_OFFERS,
  INITIAL_EVIDENCE,
  INITIAL_VIOLATIONS,
  INITIAL_RECOMMENDATION,
  SAMPLE_TRANSCRIPT_TURNS,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export type DataSourceMode = 'simulation' | 'live';

class NegotiationApiClient {
  private mode: DataSourceMode = 'simulation';

  // In-memory simulation state
  private simMandates: NegotiationMandate[] = [INITIAL_MANDATE];
  private simSessions: MerchantSession[] = [...INITIAL_SESSIONS];
  private simOffers: MerchantOffer[] = [...INITIAL_OFFERS];
  private simEvidence: EvidenceItem[] = [...INITIAL_EVIDENCE];
  private simViolations: PolicyViolation[] = [...INITIAL_VIOLATIONS];
  private simRecommendations: Record<string, DealRecommendation> = {
    [INITIAL_MANDATE.id]: INITIAL_RECOMMENDATION,
  };
  private simTranscripts: Record<string, TranscriptTurn[]> = {
    'sess-sterling-02': SAMPLE_TRANSCRIPT_TURNS,
  };

  public getMode(): DataSourceMode {
    return this.mode;
  }

  public setMode(mode: DataSourceMode): void {
    this.mode = mode;
  }

  // --- 1. NEGOTIATIONS ---

  async listNegotiations(): Promise<NegotiationMandate[]> {
    if (this.mode === 'simulation') {
      return [...this.simMandates];
    }
    const res = await fetch(`${API_BASE_URL}/negotiations`);
    if (!res.ok) throw new Error(`Failed to fetch negotiations: ${res.statusText}`);
    return res.json();
  }

  async getNegotiation(id: string): Promise<NegotiationMandate> {
    if (this.mode === 'simulation') {
      const mandate = this.simMandates.find((m) => m.id === id);
      if (!mandate) throw new Error(`Negotiation with id ${id} not found`);
      return { ...mandate };
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch negotiation ${id}: ${res.statusText}`);
    return res.json();
  }

  async createNegotiation(
    payload: Omit<NegotiationMandate, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<NegotiationMandate> {
    if (this.mode === 'simulation') {
      const newMandate: NegotiationMandate = {
        ...payload,
        id: `mandate-${Date.now()}`,
        status: 'mandate_active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.simMandates.unshift(newMandate);
      return newMandate;
    }
    const res = await fetch(`${API_BASE_URL}/negotiations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create negotiation: ${res.statusText}`);
    return res.json();
  }

  // --- 2. SESSIONS & VOICE TOKENS ---

  async listSessions(negotiationId: string): Promise<MerchantSession[]> {
    if (this.mode === 'simulation') {
      return this.simSessions.filter((s) => s.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/sessions`);
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
    return res.json();
  }

  async createSession(
    negotiationId: string,
    merchantName: string,
    merchantRepName?: string
  ): Promise<MerchantSession> {
    if (this.mode === 'simulation') {
      const newSession: MerchantSession = {
        id: `sess-${Date.now()}`,
        negotiationId,
        merchantName,
        merchantRepName: merchantRepName || 'Merchant Representative',
        roomId: `room-${Date.now()}`,
        status: 'created',
        startedAt: new Date().toISOString(),
        agentDisclosureCompleted: false,
        recordingConsentObtained: false,
      };
      this.simSessions.push(newSession);
      return newSession;
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantName, merchantRepName }),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
    return res.json();
  }

  async getRoomToken(sessionId: string, identity: string): Promise<{ token: string; url: string }> {
    if (this.mode === 'simulation') {
      // Return simulated room credentials for browser WebRTC testing
      return {
        token: `sim-token-${sessionId}-${identity}`,
        url: 'wss://simulated.livekit.cloud',
      };
    }
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity }),
    });
    if (!res.ok) throw new Error(`Failed to get room token: ${res.statusText}`);
    return res.json();
  }

  // --- 3. EVIDENCE LEDGER ---

  async listEvidence(negotiationId: string): Promise<EvidenceItem[]> {
    if (this.mode === 'simulation') {
      return this.simEvidence.filter((e) => e.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/evidence`);
    if (!res.ok) throw new Error(`Failed to fetch evidence: ${res.statusText}`);
    return res.json();
  }

  async addEvidence(evidence: Omit<EvidenceItem, 'id'>): Promise<EvidenceItem> {
    if (this.mode === 'simulation') {
      const newItem: EvidenceItem = {
        ...evidence,
        id: `ev-${Date.now()}`,
      };
      this.simEvidence.unshift(newItem);
      return newItem;
    }
    const res = await fetch(`${API_BASE_URL}/internal/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidence),
    });
    if (!res.ok) throw new Error(`Failed to record evidence: ${res.statusText}`);
    return res.json();
  }

  // --- 4. OFFERS & POLICY VIOLATIONS ---

  async listOffers(negotiationId: string): Promise<MerchantOffer[]> {
    if (this.mode === 'simulation') {
      return this.simOffers.filter((o) => o.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/offers`);
    if (!res.ok) throw new Error(`Failed to fetch offers: ${res.statusText}`);
    return res.json();
  }

  async listViolations(negotiationId: string): Promise<PolicyViolation[]> {
    if (this.mode === 'simulation') {
      return this.simViolations.filter((v) => v.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/violations`);
    if (!res.ok) throw new Error(`Failed to fetch violations: ${res.statusText}`);
    return res.json();
  }

  // --- 5. RECOMMENDATION & BUYER APPROVAL ---

  async getRecommendation(negotiationId: string): Promise<DealRecommendation | null> {
    if (this.mode === 'simulation') {
      return this.simRecommendations[negotiationId] || null;
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/recommendation`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch recommendation: ${res.statusText}`);
    return res.json();
  }

  async approveRecommendation(
    negotiationId: string,
    reviewedBy: string,
    comments: string
  ): Promise<DealRecommendation> {
    if (this.mode === 'simulation') {
      const current = this.simRecommendations[negotiationId];
      if (!current) throw new Error('Recommendation not found');
      const updated: DealRecommendation = {
        ...current,
        status: 'reviewed',
        buyerReviewAction: {
          reviewedBy,
          approvedAt: new Date().toISOString(),
          comments,
        },
      };
      this.simRecommendations[negotiationId] = updated;
      return updated;
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/recommendation/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewedBy, comments }),
    });
    if (!res.ok) throw new Error(`Failed to approve recommendation: ${res.statusText}`);
    return res.json();
  }

  // --- 6. TRANSCRIPTS ---

  getTranscriptTurns(sessionId: string): TranscriptTurn[] {
    return this.simTranscripts[sessionId] || [];
  }
}

export const apiClient = new NegotiationApiClient();
