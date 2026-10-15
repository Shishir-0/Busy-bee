import type {
  EvidenceEvent,
  OfferTerms,
  ExtractedTermEntry,
  EvidenceVerificationStatus,
} from "@busy-bee/contracts";

export interface TranscriptTurn {
  turnId: string;
  speaker: "merchant" | "agent" | "system";
  text: string;
  timestampMs: number;
}

export class EvidenceLedger {
  private turns: Map<string, TranscriptTurn> = new Map();
  private events: EvidenceEvent[] = [];
  private currentTerms: OfferTerms = {
    unitPrice: null,
    totalPrice: null,
    quantity: null,
    currency: "INR",
    shippingCost: null,
    isShippingIncluded: null,
    taxes: null,
    warrantyMonths: null,
    deliveryDays: null,
    paymentTerms: null,
    productSpecs: null,
    status: "proposed",
  };

  /**
   * Record an authentic captured audio transcript turn from LiveKit/OpenAI
   */
  public recordTurn(turn: TranscriptTurn): void {
    this.turns.set(turn.turnId, turn);
  }

  /**
   * Verify if a source turn ID actually exists in the captured transcript
   */
  public hasTurn(turnId: string): boolean {
    return this.turns.has(turnId);
  }

  public getTurn(turnId: string): TranscriptTurn | undefined {
    return this.turns.get(turnId);
  }

  public getAllTurns(): TranscriptTurn[] {
    return Array.from(this.turns.values()).sort((a, b) => a.timestampMs - b.timestampMs);
  }

  /**
   * Ingest an evidence observation linked to an actual source turn.
   * Enforces that the turn MUST exist in the transcript ledger.
   */
  public recordEvidenceEvent(event: EvidenceEvent): {
    success: boolean;
    error?: string;
    updatedTerms: OfferTerms;
  } {
    // Audit check: Verify source turn existence (Scenario N: False transcript evidence)
    if (!this.turns.has(event.sourceTurnId)) {
      return {
        success: false,
        error: `Invalid evidence source: Turn '${event.sourceTurnId}' does not exist in captured transcript history.`,
        updatedTerms: this.currentTerms,
      };
    }

    const source = this.turns.get(event.sourceTurnId)!;
    // Verify speaker matches
    if (source.speaker !== event.speaker) {
      return {
        success: false,
        error: `Speaker mismatch: turn was spoken by '${source.speaker}' but event claims '${event.speaker}'.`,
        updatedTerms: this.currentTerms,
      };
    }

    this.events.push(event);

    // Apply extracted terms to current offer state
    for (const term of event.extractedTerms) {
      this.applyTerm(term);
    }

    // Recompute total price if unit price and quantity exist
    if (this.currentTerms.unitPrice !== null && this.currentTerms.quantity !== null) {
      this.currentTerms.totalPrice = this.currentTerms.unitPrice * this.currentTerms.quantity;
    }

    return {
      success: true,
      updatedTerms: { ...this.currentTerms },
    };
  }

  private applyTerm(term: ExtractedTermEntry): void {
    switch (term.key) {
      case "unitPrice":
        if (typeof term.value === "number") {
          // Check for price conflict
          if (this.currentTerms.unitPrice !== null && this.currentTerms.unitPrice !== term.value) {
            this.currentTerms.status = "disputed";
          }
          this.currentTerms.unitPrice = term.value;
        }
        break;
      case "quantity":
        if (typeof term.value === "number") {
          this.currentTerms.quantity = term.value;
        }
        break;
      case "shippingCost":
        if (typeof term.value === "number") {
          this.currentTerms.shippingCost = term.value;
        }
        break;
      case "isShippingIncluded":
        if (typeof term.value === "boolean") {
          this.currentTerms.isShippingIncluded = term.value;
          if (term.value === true) {
            this.currentTerms.shippingCost = 0;
          }
        }
        break;
      case "warrantyMonths":
        if (typeof term.value === "number") {
          this.currentTerms.warrantyMonths = term.value;
        }
        break;
      case "deliveryDays":
        if (typeof term.value === "number") {
          this.currentTerms.deliveryDays = term.value;
        }
        break;
      case "paymentTerms":
        if (typeof term.value === "string") {
          this.currentTerms.paymentTerms = term.value;
        }
        break;
    }
  }

  public getCurrentTerms(): OfferTerms {
    return { ...this.currentTerms };
  }

  public getEvents(): EvidenceEvent[] {
    return [...this.events];
  }

  /**
   * Check which required commercial fields remain unresolved (missing or null).
   * Crucial rule: Shipping unknown is NOT zero!
   */
  public getUnresolvedFields(): string[] {
    const unresolved: string[] = [];
    if (this.currentTerms.unitPrice === null) unresolved.push("unitPrice");
    if (this.currentTerms.quantity === null) unresolved.push("quantity");
    if (this.currentTerms.shippingCost === null && this.currentTerms.isShippingIncluded === null) {
      unresolved.push("shippingCost");
    }
    if (this.currentTerms.deliveryDays === null) unresolved.push("deliveryDays");
    if (this.currentTerms.warrantyMonths === null) unresolved.push("warrantyMonths");
    return unresolved;
  }
}
