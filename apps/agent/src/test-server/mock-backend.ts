import {
  type NegotiationMandate,
  type MerchantSession,
  type OfferTerms,
  type EvidenceEvent,
  type PolicyDecision,
  type GetNegotiationContextOutput,
  type SubmitOfferObservationInput,
  type SubmitOfferObservationOutput,
  type RequestNegotiationActionInput,
  type RequestNegotiationActionOutput,
  type SubmitConfirmationRequestInput,
  type SubmitConfirmationRequestOutput,
  type EndNegotiationSessionInput,
  type EndNegotiationSessionOutput,
  type LandedCostCalculation,
  type Recommendation,
  type OfferComparisonItem,
} from "@busy-bee/contracts";

export class MockNegotiationBackend {
  private mandates: Map<string, NegotiationMandate> = new Map();
  private sessions: Map<string, MerchantSession> = new Map();
  private offers: Map<string, OfferTerms> = new Map();
  private events: Map<string, EvidenceEvent[]> = new Map();
  private idempotencyStore: Map<string, unknown> = new Map();
  private rounds: Map<string, number> = new Map(); // sessionId -> roundCount

  constructor() {
    this.seedDefaultMandate();
  }

  private seedDefaultMandate(): void {
    const defaultMandate: NegotiationMandate = {
      id: "neg-demo-001",
      objective: "50 Ergonomic Mesh Office Chairs",
      quantity: 50,
      currency: "INR",
      totalBudget: 150000, // ₹150,000 all-in
      maxUnitBudget: 3000, // ₹3,000/chair max
      targetUnitPrice: 2700, // ₹2,700/chair target
      deliveryDeadlineDays: 5, // <= 5 days
      minWarrantyMonths: 12, // >= 12 months
      requiredSpecs: ["BIFMA Certified", "High Density Foam", "Adjustable Lumbar"],
      maxCounterRounds: 3,
      permittedConcessions: {
        allowFlexiblePayment: true,
        allowVolumeDiscount: true,
      },
      status: "active",
    };
    this.mandates.set(defaultMandate.id, defaultMandate);

    // Seed Merchant A session
    const sessionA: MerchantSession = {
      sessionId: "sess-merchant-a",
      negotiationId: defaultMandate.id,
      merchantName: "Apex Office Supplies",
      roomId: "room-apex-01",
      startedAt: Date.now(),
      endedAt: null,
      status: "active",
      consentObtained: true,
      consentTimestampMs: Date.now(),
      closureReason: null,
    };
    this.sessions.set(sessionA.sessionId, sessionA);

    // Seed Merchant B session
    const sessionB: MerchantSession = {
      sessionId: "sess-merchant-b",
      negotiationId: defaultMandate.id,
      merchantName: "Bharat Ergonomics",
      roomId: "room-bharat-02",
      startedAt: Date.now(),
      endedAt: null,
      status: "active",
      consentObtained: true,
      consentTimestampMs: Date.now(),
      closureReason: null,
    };
    this.sessions.set(sessionB.sessionId, sessionB);
  }

  public setMandate(mandate: NegotiationMandate): void {
    this.mandates.set(mandate.id, mandate);
  }

  public setSession(session: MerchantSession): void {
    this.sessions.set(session.sessionId, session);
  }

  public getContext(negotiationId: string, sessionId: string): GetNegotiationContextOutput {
    const mandate = this.mandates.get(negotiationId);
    if (!mandate) throw new Error(`Negotiation '${negotiationId}' not found.`);

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session '${sessionId}' not found.`);

    const currentOffer = this.offers.get(sessionId) || null;
    const sessionEvents = this.events.get(sessionId) || [];
    const rounds = this.rounds.get(sessionId) || 0;

    return {
      mandate,
      session,
      currentOffer,
      evidenceCount: sessionEvents.length,
      roundsCompleted: rounds,
      maxRounds: mandate.maxCounterRounds,
    };
  }

  public submitObservation(input: SubmitOfferObservationInput): SubmitOfferObservationOutput {
    // Idempotency check (FR-08 / Scenario J)
    if (this.idempotencyStore.has(input.idempotencyKey)) {
      return this.idempotencyStore.get(input.idempotencyKey) as SubmitOfferObservationOutput;
    }

    const session = this.sessions.get(input.sessionId);
    if (!session) throw new Error(`Session '${input.sessionId}' not found.`);

    const eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const event: EvidenceEvent = {
      eventId,
      negotiationId: input.negotiationId,
      sessionId: input.sessionId,
      sourceTurnId: input.sourceTurnId,
      timestampMs: input.timestampMs,
      speaker: input.speaker,
      sourceText: input.sourceText,
      extractedTerms: input.extractedTerms,
      verificationStatus: input.extractionStatus === "clear" ? "verified" : "needs_review",
    };

    if (!this.events.has(input.sessionId)) {
      this.events.set(input.sessionId, []);
    }
    this.events.get(input.sessionId)!.push(event);

    // Update session offer
    let current = this.offers.get(input.sessionId) || {
      unitPrice: null,
      totalPrice: null,
      quantity: null,
      currency: "INR",
      shippingCost: null,
      isShippingIncluded: null,
      taxes: 0,
      warrantyMonths: null,
      deliveryDays: null,
      paymentTerms: null,
      productSpecs: null,
      status: "proposed",
    };

    for (const term of input.extractedTerms) {
      if (term.key === "unitPrice" && typeof term.value === "number") current.unitPrice = term.value;
      if (term.key === "quantity" && typeof term.value === "number") current.quantity = term.value;
      if (term.key === "shippingCost" && typeof term.value === "number") current.shippingCost = term.value;
      if (term.key === "isShippingIncluded" && typeof term.value === "boolean") current.isShippingIncluded = term.value;
      if (term.key === "warrantyMonths" && typeof term.value === "number") current.warrantyMonths = term.value;
      if (term.key === "deliveryDays" && typeof term.value === "number") current.deliveryDays = term.value;
      if (term.key === "paymentTerms" && typeof term.value === "string") current.paymentTerms = term.value;
    }

    if (current.unitPrice && current.quantity) {
      current.totalPrice = current.unitPrice * current.quantity;
    }

    this.offers.set(input.sessionId, current);

    const unresolved: string[] = [];
    if (current.shippingCost === null && current.isShippingIncluded === null) unresolved.push("shippingCost");
    if (current.deliveryDays === null) unresolved.push("deliveryDays");
    if (current.warrantyMonths === null) unresolved.push("warrantyMonths");

    const result: SubmitOfferObservationOutput = {
      success: true,
      eventId,
      offerStatus: current.status,
      verificationStatus: event.verificationStatus,
      updatedTerms: current,
      unresolvedFields: unresolved,
      message: "Observation successfully recorded and ledgered.",
    };

    this.idempotencyStore.set(input.idempotencyKey, result);
    return result;
  }

  public evaluateAction(input: RequestNegotiationActionInput): RequestNegotiationActionOutput {
    if (this.idempotencyStore.has(input.idempotencyKey)) {
      return this.idempotencyStore.get(input.idempotencyKey) as RequestNegotiationActionOutput;
    }

    const mandate = this.mandates.get(input.negotiationId);
    if (!mandate) throw new Error(`Negotiation '${input.negotiationId}' not found.`);

    const currentOffer = this.offers.get(input.sessionId);
    const rounds = (this.rounds.get(input.sessionId) || 0) + 1;
    this.rounds.set(input.sessionId, rounds);

    let decision: PolicyDecision;

    // Check round limit
    if (rounds > mandate.maxCounterRounds) {
      decision = {
        allowed: false,
        action: "stop_negotiating",
        reason: `Maximum counteroffer rounds (${mandate.maxCounterRounds}) reached. Conclude or request buyer review.`,
        unresolvedFields: [],
      };
    } else if (input.proposedUnitPrice !== undefined) {
      const projectedTotal = input.proposedUnitPrice * mandate.quantity;

      // Hard financial ceiling check
      if (input.proposedUnitPrice > mandate.maxUnitBudget) {
        decision = {
          allowed: false,
          action: "offer_rejected_by_policy",
          reason: `Proposed unit price ₹${input.proposedUnitPrice} exceeds maximum budget ceiling of ₹${mandate.maxUnitBudget} per unit.`,
          maxPermittedCounter: mandate.maxUnitBudget,
          suggestedCounter: mandate.targetUnitPrice,
          unresolvedFields: [],
        };
      } else if (projectedTotal > mandate.totalBudget) {
        decision = {
          allowed: false,
          action: "offer_rejected_by_policy",
          reason: `Total projected cost ₹${projectedTotal} exceeds total budget cap of ₹${mandate.totalBudget}.`,
          maxPermittedCounter: Math.floor(mandate.totalBudget / mandate.quantity),
          suggestedCounter: mandate.targetUnitPrice,
          unresolvedFields: [],
        };
      } else {
        // Counter is permitted!
        decision = {
          allowed: true,
          action: "counteroffer_permitted",
          maxPermittedCounter: mandate.maxUnitBudget,
          suggestedCounter: Math.min(input.proposedUnitPrice, mandate.targetUnitPrice),
          reason: `Proposed price ₹${input.proposedUnitPrice} is within authorized budget parameters.`,
          unresolvedFields: [],
        };
      }
    } else {
      decision = {
        allowed: true,
        action: "collect_missing_terms",
        reason: "Clarify unstated terms (shipping, warranty, delivery) before making monetary commitments.",
        unresolvedFields: ["shippingCost", "deliveryDays", "warrantyMonths"],
      };
    }

    const response: RequestNegotiationActionOutput = {
      decision,
      sessionId: input.sessionId,
      revision: rounds,
    };

    this.idempotencyStore.set(input.idempotencyKey, response);
    return response;
  }

  public confirmTerms(input: SubmitConfirmationRequestInput): SubmitConfirmationRequestOutput {
    if (this.idempotencyStore.has(input.idempotencyKey)) {
      return this.idempotencyStore.get(input.idempotencyKey) as SubmitConfirmationRequestOutput;
    }

    const currentOffer = this.offers.get(input.sessionId);
    if (!currentOffer) throw new Error("No active offer found to confirm.");

    const unresolved: string[] = [];
    if (currentOffer.shippingCost === null && currentOffer.isShippingIncluded === null) {
      unresolved.push("shippingCost");
    }
    if (currentOffer.deliveryDays === null) unresolved.push("deliveryDays");
    if (currentOffer.warrantyMonths === null) unresolved.push("warrantyMonths");

    const isReady = unresolved.length === 0;
    currentOffer.status = isReady ? "merchant_confirmed" : "incomplete";

    const response: SubmitConfirmationRequestOutput = {
      success: true,
      confirmedTerms: input.confirmedTerms,
      unresolvedTerms: unresolved,
      offerStatus: currentOffer.status,
      readyForReview: isReady,
      message: isReady
        ? "All terms explicitly confirmed with verified evidence."
        : `Terms confirmed, but material fields remain unresolved: ${unresolved.join(", ")}. Cannot mark deal fully accepted.`,
    };

    this.idempotencyStore.set(input.idempotencyKey, response);
    return response;
  }

  public endSession(input: EndNegotiationSessionInput): EndNegotiationSessionOutput {
    const session = this.sessions.get(input.sessionId);
    if (!session) throw new Error(`Session '${input.sessionId}' not found.`);

    session.status = "ended";
    session.endedAt = Date.now();
    session.closureReason = input.reason;

    return {
      success: true,
      sessionId: input.sessionId,
      finalStatus: "ended",
      message: `Session concluded: ${input.summary}`,
    };
  }

  public calculateLandedCost(terms: OfferTerms, mandateQty: number): LandedCostCalculation {
    const qty = terms.quantity ?? mandateQty;
    const unitPrice = terms.unitPrice ?? 0;
    const subtotal = qty * unitPrice;
    const shipping = terms.shippingCost ?? 0;
    const taxes = terms.taxes ?? 0;
    const total = subtotal + shipping + taxes;

    const missing: string[] = [];
    if (terms.unitPrice === null) missing.push("unitPrice");
    if (terms.shippingCost === null && terms.isShippingIncluded === null) missing.push("shippingCost");
    if (terms.warrantyMonths === null) missing.push("warrantyMonths");
    if (terms.deliveryDays === null) missing.push("deliveryDays");

    return {
      quantity: qty,
      unitPrice,
      subtotal,
      shippingCost: shipping,
      isShippingIncluded: terms.isShippingIncluded ?? false,
      taxes,
      otherFees: 0,
      totalLandedCost: total,
      isComplete: missing.length === 0,
      missingComponents: missing,
    };
  }

  public generateRecommendation(negotiationId: string): Recommendation {
    const mandate = this.mandates.get(negotiationId);
    if (!mandate) throw new Error(`Negotiation '${negotiationId}' not found.`);

    const items: OfferComparisonItem[] = [];

    for (const session of this.sessions.values()) {
      if (session.negotiationId !== negotiationId) continue;
      const terms = this.offers.get(session.sessionId);
      if (!terms) continue;

      const calc = this.calculateLandedCost(terms, mandate.quantity);
      const exclusions: string[] = [];

      if (!calc.isComplete) {
        exclusions.push(`Missing confirmed terms: ${calc.missingComponents.join(", ")}`);
      }
      if (calc.totalLandedCost > mandate.totalBudget) {
        exclusions.push(`Total landed cost ₹${calc.totalLandedCost} exceeds ₹${mandate.totalBudget} budget.`);
      }
      if (terms.deliveryDays && terms.deliveryDays > mandate.deliveryDeadlineDays) {
        exclusions.push(`Delivery timeline (${terms.deliveryDays}d) exceeds ${mandate.deliveryDeadlineDays}d deadline.`);
      }
      if (terms.warrantyMonths && terms.warrantyMonths < mandate.minWarrantyMonths) {
        exclusions.push(`Warranty (${terms.warrantyMonths}m) is below required ${mandate.minWarrantyMonths}m.`);
      }

      const isEligible = exclusions.length === 0 && calc.isComplete;
      const events = this.events.get(session.sessionId) || [];
      const verifiedCount = events.filter((e) => e.verificationStatus === "verified").length;
      const coverage = events.length > 0 ? Math.round((verifiedCount / events.length) * 100) : 0;

      items.push({
        merchantName: session.merchantName,
        sessionId: session.sessionId,
        terms,
        calculation: calc,
        isEligible,
        exclusionReasons: exclusions,
        verificationCoverage: coverage,
      });
    }

    // Sort: eligible offers ranked by lowest landed cost first
    const eligible = items.filter((i) => i.isEligible).sort((a, b) => a.calculation.totalLandedCost - b.calculation.totalLandedCost);
    const winner = eligible.length > 0 ? eligible[0] : null;

    return {
      negotiationId,
      winnerSessionId: winner ? winner.sessionId : null,
      winnerMerchantName: winner ? winner.merchantName : null,
      rankings: items.sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;
        return a.calculation.totalLandedCost - b.calculation.totalLandedCost;
      }),
      recommendationState: winner ? "ready_for_review" : items.length > 0 ? "provisional" : "not_ready",
      justification: winner
        ? `Recommended: ${winner.merchantName} at lowest landed cost of ₹${winner.calculation.totalLandedCost.toLocaleString()} with all ${mandate.quantity} units, verified delivery within ${winner.terms.deliveryDays} days, and ${winner.terms.warrantyMonths} months warranty.`
        : "No offer is currently fully eligible. Check unresolved conditions or policy exclusions.",
      unresolvedConditions: winner ? [] : items.flatMap((i) => i.exclusionReasons),
      generatedAt: Date.now(),
    };
  }
}
