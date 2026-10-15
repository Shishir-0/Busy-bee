/**
 * The Negotiator • Central API Client
 * Supports both Live Express/MongoDB backend (default) and explicitly labeled Simulation Provider
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
  // Default to LIVE backend API and database records
  private mode: DataSourceMode = 'live';

  // In-memory simulation fixtures (ONLY active when explicitly set to 'simulation')
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

  // Real live session in-memory transcript store (starts empty; populated only by real turns)
  private liveTranscripts: Record<string, TranscriptTurn[]> = {};

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
    const rawList = await res.json();
    return rawList.map((m: any) => ({
      id: m.id,
      title: m.title || m.objective || 'Procurement Mandate',
      objective: m.objective,
      quantity: m.quantity,
      currency: m.currency || 'INR',
      maxBudget: m.maxBudget,
      deliveryDeadlineDays: m.deliveryDeadlineDays,
      minWarrantyMonths: m.minWarrantyMonths,
      mandatorySpecs: m.mandatorySpecifications || m.mandatorySpecs || [],
      authority: m.authority || {
        targetUnitPrice: m.counterOfferPolicy?.targetUnitPrice || Math.round(m.maxBudget / m.quantity),
        maxUnitPrice: m.counterOfferPolicy?.maxUnitConcession ? m.counterOfferPolicy.maxUnitConcession : Math.round(m.maxBudget / m.quantity),
        strictBudgetCap: true,
        maxDeliveryDays: m.deliveryDeadlineDays,
        minWarrantyMonths: m.minWarrantyMonths,
        permittedConcessions: [],
      },
      status: m.status || 'mandate_active',
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }

  async getNegotiation(id: string): Promise<NegotiationMandate> {
    if (this.mode === 'simulation') {
      const mandate = this.simMandates.find((m) => m.id === id);
      if (!mandate) throw new Error(`Negotiation with id ${id} not found`);
      return { ...mandate };
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch negotiation ${id}: ${res.statusText}`);
    const m = await res.json();
    return {
      id: m.id,
      title: m.title || m.objective || 'Procurement Mandate',
      objective: m.objective,
      quantity: m.quantity,
      currency: m.currency || 'INR',
      maxBudget: m.maxBudget,
      deliveryDeadlineDays: m.deliveryDeadlineDays,
      minWarrantyMonths: m.minWarrantyMonths,
      mandatorySpecs: m.mandatorySpecifications || m.mandatorySpecs || [],
      authority: m.authority || {
        targetUnitPrice: m.counterOfferPolicy?.targetUnitPrice || Math.round(m.maxBudget / m.quantity),
        maxUnitPrice: m.counterOfferPolicy?.maxUnitConcession ? m.counterOfferPolicy.maxUnitConcession : Math.round(m.maxBudget / m.quantity),
        strictBudgetCap: true,
        maxDeliveryDays: m.deliveryDeadlineDays,
        minWarrantyMonths: m.minWarrantyMonths,
        permittedConcessions: [],
      },
      status: m.status || 'mandate_active',
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
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
    const body = {
      objective: payload.objective,
      quantity: payload.quantity,
      currency: 'INR',
      maxBudget: payload.maxBudget,
      deliveryDeadlineDays: payload.deliveryDeadlineDays,
      minWarrantyMonths: payload.minWarrantyMonths,
      mandatorySpecifications: payload.mandatorySpecs || [],
      counterOfferPolicy: {
        targetUnitPrice: payload.authority?.targetUnitPrice,
        maxUnitConcession: payload.authority?.maxUnitPrice,
      },
    };
    const res = await fetch(`${API_BASE_URL}/negotiations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to create negotiation: ${res.statusText}`);
    const m = await res.json();
    return {
      id: m.id,
      title: m.title || m.objective || payload.title,
      objective: m.objective,
      quantity: m.quantity,
      currency: m.currency || 'INR',
      maxBudget: m.maxBudget,
      deliveryDeadlineDays: m.deliveryDeadlineDays,
      minWarrantyMonths: m.minWarrantyMonths,
      mandatorySpecs: m.mandatorySpecifications || payload.mandatorySpecs || [],
      authority: payload.authority,
      status: m.status || 'mandate_active',
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  // --- 2. SESSIONS & VOICE TOKENS ---

  async listSessions(negotiationId: string): Promise<MerchantSession[]> {
    if (this.mode === 'simulation') {
      return this.simSessions.filter((s) => s.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/sessions`);
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((s: any) => ({
      id: s.id,
      negotiationId: s.negotiationId,
      merchantName: s.merchantName,
      merchantRepName: s.merchantRepName || s.merchantRole || 'Representative',
      roomId: s.roomId,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      agentDisclosureCompleted: Boolean(s.agentDisclosureCompleted ?? true),
      recordingConsentObtained: Boolean(s.recordingConsentObtained ?? true),
    }));
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
      body: JSON.stringify({ merchantName, merchantRole: merchantRepName || 'sales_representative' }),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
    const s = await res.json();
    return {
      id: s.id,
      negotiationId: s.negotiationId,
      merchantName: s.merchantName,
      merchantRepName: s.merchantRepName || s.merchantRole || merchantRepName || 'Representative',
      roomId: s.roomId,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      agentDisclosureCompleted: true,
      recordingConsentObtained: true,
    };
  }

  async getRoomToken(sessionId: string, identity: string): Promise<{ token: string; url: string; isLiveConfigured?: boolean }> {
    if (this.mode === 'simulation') {
      return {
        token: `sim-token-${sessionId}-${identity}`,
        url: 'wss://simulated.livekit.cloud',
        isLiveConfigured: false,
      };
    }
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, role: 'merchant' }),
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
    const raw = await res.json();
    return raw.map((e: any) => {
      const termEntries = Object.entries(e.extractedTerms || {});
      const firstTerm = termEntries[0] || ['general', e.sourceText];
      return {
        id: e.id,
        negotiationId: e.negotiationId,
        sessionId: e.sessionId,
        sourceTurnId: e.sourceTurnId || e.id,
        timestamp: e.timestamp,
        speaker: e.speaker === 'merchant' ? 'merchant' : e.speaker === 'buyer' ? 'buyer' : 'agent',
        speakerLabel: e.speaker === 'merchant' ? 'Merchant' : e.speaker === 'buyer' ? 'Buyer' : 'The Negotiator (AI Agent)',
        transcriptExcerpt: e.sourceText,
        termKey: (firstTerm[0] as any) || 'price',
        extractedField: firstTerm[0],
        extractedValue: String(firstTerm[1]),
        verificationStatus: e.verificationStatus || 'verified',
        notes: e.verificationReason,
      };
    });
  }

  // --- 4. OFFERS & POLICY VIOLATIONS ---

  async listOffers(negotiationId: string): Promise<MerchantOffer[]> {
    if (this.mode === 'simulation') {
      return this.simOffers.filter((o) => o.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/offers`);
    if (!res.ok) throw new Error(`Failed to fetch offers: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((o: any) => ({
      id: o.id,
      negotiationId: o.negotiationId,
      sessionId: o.sessionId,
      merchantName: o.merchantName,
      revision: o.revision || 1,
      status: o.status || 'proposed',
      terms: {
        unitPrice: o.terms?.unitPrice ?? 0,
        quantity: o.terms?.quantity ?? 0,
        subtotal: o.costBreakdown?.productSubtotal ?? ((o.terms?.unitPrice ?? 0) * (o.terms?.quantity || 1)),
        taxes: o.costBreakdown?.taxesAmount ?? 0,
        shippingCost: o.costBreakdown?.isShippingKnown ? o.costBreakdown.shippingFee : null,
        additionalFees: o.costBreakdown?.additionalFees ?? 0,
        totalLandedCost: o.costBreakdown?.isComplete ? o.costBreakdown.totalLandedCost : null,
        deliveryDays: o.terms?.deliveryDays ?? null,
        warrantyMonths: o.terms?.warrantyMonths ?? null,
        paymentTerms: o.terms?.paymentTerms,
      },
      isEligible: o.costBreakdown?.isComplete ?? true,
      ineligibilityReason: !o.costBreakdown?.isComplete
        ? `Incomplete terms: ${o.costBreakdown?.missingComponents?.join(', ') || 'missing logistics'}`
        : undefined,
      evidenceIds: o.supportingEvidenceIds || [],
      updatedAt: o.updatedAt || new Date().toISOString(),
    }));
  }

  async listViolations(negotiationId: string): Promise<PolicyViolation[]> {
    if (this.mode === 'simulation') {
      return this.simViolations.filter((v) => v.negotiationId === negotiationId);
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/violations`);
    if (!res.ok) throw new Error(`Failed to fetch violations: ${res.statusText}`);
    const raw = await res.json();
    return raw.map((v: any, idx: number) => ({
      id: v.id || `vio-${idx}`,
      negotiationId,
      sessionId: v.sessionId || 'session',
      timestamp: v.timestamp || new Date().toISOString(),
      ruleName: v.rule || v.ruleName || 'Negotiation Policy Rule',
      attemptedValue: v.attemptedValue ?? 'Exceeded ceiling',
      limitValue: v.limitValue ?? 'Ceiling',
      reason: v.message || v.reason || 'Blocked by Negotiation Guard',
      status: 'blocked_by_guard' as const,
    }));
  }

  // --- 5. RECOMMENDATION & BUYER APPROVAL ---

  async getRecommendation(negotiationId: string): Promise<DealRecommendation | null> {
    if (this.mode === 'simulation') {
      return this.simRecommendations[negotiationId] || null;
    }
    const res = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/recommendation`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch recommendation: ${res.statusText}`);
    const raw = await res.json();
    if (!raw || !raw.id) return null;
    return {
      id: raw.id,
      negotiationId: raw.negotiationId,
      status: raw.status || 'ready_for_review',
      recommendedOfferId: raw.winnerOfferId || raw.eligibleOffers?.[0]?.offerId || null,
      recommendedMerchant: raw.winnerMerchantName || raw.eligibleOffers?.[0]?.merchantName || 'Awaiting Shortlist',
      totalLandedCost: raw.eligibleOffers?.[0]?.totalLandedCost ?? 0,
      budgetRemaining: raw.eligibleOffers?.[0]?.budgetRemaining ?? 0,
      eligibleOfferIds: raw.eligibleOffers?.map((o: any) => o.offerId || o.id) || [],
      excludedOffers: raw.ineligibleOffers?.map((io: any) => ({
        offerId: io.offerId || io.id,
        merchantName: io.merchantName,
        reason: io.reason || io.ineligibilityReason || 'Failed mandatory criteria',
      })) || [],
      calculationBreakdown: {
        formula: raw.formulaExplanation || 'Total Landed Cost = Subtotal + Shipping + Taxes',
        items: [
          { label: 'Winning Landed Cost', amount: raw.eligibleOffers?.[0]?.totalLandedCost ?? 0 },
        ],
      },
      reasons: raw.formulaExplanation ? [raw.formulaExplanation] : ['Complies with all mandate budget and delivery criteria.'],
      supportingEvidenceIds: [],
      unresolvedConditions: raw.unresolvedConditions || [],
      buyerReviewAction: raw.buyerReviewAction || null,
    };
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
    const raw = await res.json();
    return {
      id: raw.id,
      negotiationId: raw.negotiationId,
      status: 'reviewed',
      recommendedOfferId: raw.winnerOfferId || raw.eligibleOffers?.[0]?.offerId || null,
      recommendedMerchant: raw.winnerMerchantName || raw.eligibleOffers?.[0]?.merchantName || 'Awaiting Shortlist',
      totalLandedCost: raw.eligibleOffers?.[0]?.totalLandedCost ?? 0,
      budgetRemaining: raw.eligibleOffers?.[0]?.budgetRemaining ?? 0,
      eligibleOfferIds: raw.eligibleOffers?.map((o: any) => o.offerId || o.id) || [],
      excludedOffers: raw.ineligibleOffers || [],
      calculationBreakdown: {
        formula: raw.formulaExplanation || 'Total Landed Cost = Subtotal + Shipping + Taxes',
        items: [
          { label: 'Winning Landed Cost', amount: raw.eligibleOffers?.[0]?.totalLandedCost ?? 0 },
        ],
      },
      reasons: raw.formulaExplanation ? [raw.formulaExplanation] : ['Complies with all mandate budget and delivery criteria.'],
      supportingEvidenceIds: [],
      unresolvedConditions: raw.unresolvedConditions || [],
      buyerReviewAction: raw.buyerReviewAction || {
        reviewedBy,
        approvedAt: new Date().toISOString(),
        comments,
      },
    };
  }

  // --- 6. TRANSCRIPTS ---

  getTranscriptTurns(sessionId: string): TranscriptTurn[] {
    if (this.mode === 'simulation') {
      return this.simTranscripts[sessionId] || [];
    }
    // In live mode, return strictly recorded live turns (never fake default turns)
    return this.liveTranscripts[sessionId] || [];
  }

  addLiveTranscriptTurn(sessionId: string, turn: TranscriptTurn): void {
    if (!this.liveTranscripts[sessionId]) {
      this.liveTranscripts[sessionId] = [];
    }
    this.liveTranscripts[sessionId].push(turn);
  }
}

export const apiClient = new NegotiationApiClient();
