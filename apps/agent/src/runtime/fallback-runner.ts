import { EvidenceLedger, type TranscriptTurn } from "../evidence/ledger.js";
import { extractTermsFromUtterance } from "../evidence/extractor.js";
import { AgentToolHandlers } from "../tools/handlers.js";
import type { NegotiationBackendClient } from "../backend/client.js";
import {
  INITIAL_DISCLOSURE_STATEMENT,
  CONSENT_REFUSAL_STATEMENT,
} from "../instructions.js";

export interface ReplayTurn {
  speaker: "merchant" | "agent";
  text: string;
  expectedAction?: "propose_counter" | "clarify_shipping" | "clarify_warranty" | "confirm_deal" | "reject_overbudget";
}

export interface ReplayScenario {
  id: string;
  title: string;
  merchantName: string;
  turns: ReplayTurn[];
}

export class FallbackNegotiationRunner {
  private ledger: EvidenceLedger;
  private toolHandlers: AgentToolHandlers;

  constructor(private backendClient: NegotiationBackendClient) {
    this.ledger = new EvidenceLedger();
    this.toolHandlers = new AgentToolHandlers(this.backendClient, this.ledger);
  }

  public getLedger(): EvidenceLedger {
    return this.ledger;
  }

  /**
   * Run a deterministic replay scenario (Fallback B).
   * Feeds realistic merchant quotes through the identical evidence extraction,
   * tool execution, and backend policy authorization pipeline.
   */
  public async runDeterministicReplay(
    negotiationId: string,
    sessionId: string,
    scenario: ReplayScenario,
    onStep?: (msg: string) => void
  ): Promise<{
    success: boolean;
    turnsProcessed: number;
    finalTerms: unknown;
    ledgerEvents: unknown[];
  }> {
    const log = (msg: string) => {
      if (onStep) onStep(msg);
      console.log(`[REPLAY - FALLBACK B] ${msg}`);
    };

    log(`Starting replay scenario: ${scenario.title} for ${scenario.merchantName}`);

    // Step 0: Agent initial disclosure
    const disclosureTurnId = `turn-${Date.now()}-0`;
    this.ledger.recordTurn({
      turnId: disclosureTurnId,
      speaker: "agent",
      text: INITIAL_DISCLOSURE_STATEMENT,
      timestampMs: Date.now(),
    });
    log(`Agent: "${INITIAL_DISCLOSURE_STATEMENT}"`);

    // Get context from backend
    const contextRes = await this.toolHandlers.executeTool("get_negotiation_context", {
      negotiationId,
      sessionId,
    });
    if (!contextRes.success) {
      log(`Failed to fetch negotiation context: ${contextRes.error}`);
      return { success: false, turnsProcessed: 0, finalTerms: null, ledgerEvents: [] };
    }

    let turnIndex = 1;
    for (const turn of scenario.turns) {
      const turnId = `turn-${Date.now()}-${turnIndex++}`;
      const timestamp = Date.now();

      // Record transcript turn
      this.ledger.recordTurn({
        turnId,
        speaker: turn.speaker,
        text: turn.text,
        timestampMs: timestamp,
      });

      if (turn.speaker === "merchant") {
        log(`Merchant: "${turn.text}"`);

        // Check if consent was declined
        if (
          turn.text.toLowerCase().includes("no") &&
          (turn.text.toLowerCase().includes("recording") || turn.text.toLowerCase().includes("consent") || turn.text.toLowerCase().includes("don't want"))
        ) {
          log(`Participant declined evidence consent. Triggering clean session end.`);
          await this.toolHandlers.executeTool("end_negotiation_session", {
            negotiationId,
            sessionId,
            reason: "consent_declined",
            summary: "Participant declined recording disclosure.",
          });
          log(`Agent: "${CONSENT_REFUSAL_STATEMENT}"`);
          break;
        }

        // 1. Structured extraction
        const extraction = extractTermsFromUtterance(turn.text);
        if (extraction.terms.length > 0) {
          log(`Extracted terms: ${JSON.stringify(extraction.terms.map((t) => `${t.key}=${t.value}`))}`);

          // 2. Submit observation to backend
          const obsRes = await this.toolHandlers.executeTool("submit_offer_observation", {
            negotiationId,
            sessionId,
            sourceTurnId: turnId,
            timestampMs: timestamp,
            speaker: "merchant",
            sourceText: turn.text,
            extractedTerms: extraction.terms,
            extractionStatus: extraction.status,
            idempotencyKey: `obs-${sessionId}-${turnId}`,
          });

          if (!obsRes.success) {
            log(`Observation rejected: ${obsRes.error}`);
          }
        }

        // 3. Determine if policy evaluation is required
        const currentTerms = this.ledger.getCurrentTerms();
        if (currentTerms.unitPrice) {
          // If merchant quoted a price, request backend policy action before countering
          const policyRes = await this.toolHandlers.executeTool("request_negotiation_action", {
            negotiationId,
            sessionId,
            merchantLatestStatement: turn.text,
            proposedUnitPrice: currentTerms.unitPrice > 2700 ? 2700 : currentTerms.unitPrice,
            proposedAction: "counteroffer",
            idempotencyKey: `act-${sessionId}-${turnId}`,
          });

          if (policyRes.success && (policyRes.data as any)?.decision) {
            const decision = (policyRes.data as any).decision;
            if (decision.allowed) {
              log(`Backend Policy: APPROVED (${decision.action}). Reason: ${decision.reason}`);
            } else {
              log(`Backend Policy: REJECTED (${decision.action}). Reason: ${decision.reason}`);
            }
          }
        }
      } else {
        log(`Agent: "${turn.text}"`);
      }
    }

    const finalTerms = this.ledger.getCurrentTerms();
    log(`Replay complete. Final offer state: unitPrice=${finalTerms.unitPrice}, shipping=${finalTerms.shippingCost}, status=${finalTerms.status}`);

    return {
      success: true,
      turnsProcessed: turnIndex,
      finalTerms,
      ledgerEvents: this.ledger.getEvents(),
    };
  }
}

/**
 * Standard pre-recorded scenarios from the PRD & Execution Plan
 */
export const DEMO_SCENARIO_MERCHANT_A: ReplayScenario = {
  id: "scenario-apex-chairs",
  title: "Merchant A (Apex Supplies) - Initial High Quote Negotiated Down",
  merchantName: "Apex Office Supplies",
  turns: [
    { speaker: "merchant", text: "Yes, I agree to the demonstration terms. Let's talk about the chairs." },
    { speaker: "agent", text: "Thank you. We are looking for 50 ergonomic mesh chairs. What is your best unit quote?" },
    { speaker: "merchant", text: "We can do 50 chairs at ₹3,200 each, but delivery is within 7 days and shipping is ₹3,000." },
    { speaker: "agent", text: "Our budget ceiling is firm at ₹3,000 per unit, and we need delivery within 5 days with at least 12 months warranty. Can you meet ₹2,800 with free delivery?" },
    { speaker: "merchant", text: "We can do ₹2,900 each for 50 chairs with free shipping, delivery in 4 days, and 12 months warranty." },
    { speaker: "agent", text: "Can you confirm ₹2,900 unit price with free shipping and 12 months warranty?" },
    { speaker: "merchant", text: "Yes, ₹2,900 unit price with free shipping and 12 months warranty is confirmed." },
  ],
};

export const DEMO_SCENARIO_MERCHANT_B: ReplayScenario = {
  id: "scenario-bharat-chairs",
  title: "Merchant B (Bharat Ergonomics) - Competitive Landed Cost Winner",
  merchantName: "Bharat Ergonomics",
  turns: [
    { speaker: "merchant", text: "Sure, recording is fine with me. We are ready." },
    { speaker: "agent", text: "Great. We need 50 ergonomic chairs delivered in 5 days. What is your quotation?" },
    { speaker: "merchant", text: "Our commercial price is ₹2,850 each for 50 units, shipping included, with 18 months warranty and delivery in 3 days." },
    { speaker: "agent", text: "Could you do ₹2,750 per unit for the 50 chairs?" },
    { speaker: "merchant", text: "I can meet you at ₹2,800 flat per unit, all-inclusive, 18 months warranty." },
    { speaker: "agent", text: "Let me confirm: ₹2,800 per unit, 50 units, all-inclusive shipping, 18 months warranty?" },
    { speaker: "merchant", text: "Yes, ₹2,800 per unit with 18 months warranty and free delivery is 100% confirmed." },
  ],
};
