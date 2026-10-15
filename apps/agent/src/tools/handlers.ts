import type { NegotiationBackendClient } from "../backend/client.js";
import type { EvidenceLedger } from "../evidence/ledger.js";

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export class AgentToolHandlers {
  constructor(
    private backendClient: NegotiationBackendClient,
    private ledger: EvidenceLedger
  ) {}

  public async executeTool(name: string, rawArgs: unknown): Promise<ToolExecutionResult> {
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : (rawArgs as Record<string, unknown>);

    try {
      switch (name) {
        case "get_negotiation_context": {
          const res = await this.backendClient.getNegotiationContext({
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
          });
          return { toolName: name, success: true, data: res };
        }

        case "submit_offer_observation": {
          // First check: does the source turn exist in the captured transcript ledger? (Scenario N)
          const sourceTurnId = String(args.sourceTurnId);
          if (!this.ledger.hasTurn(sourceTurnId)) {
            return {
              toolName: name,
              success: false,
              error: `Action Denied: Source turn '${sourceTurnId}' does not exist in captured transcript. Fabricated quotes cannot be ledgered as evidence.`,
            };
          }

          const res = await this.backendClient.submitOfferObservation({
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
            sourceTurnId,
            timestampMs: Number(args.timestampMs) || Date.now(),
            speaker: (args.speaker as "merchant" | "agent") || "merchant",
            sourceText: String(args.sourceText),
            extractedTerms: Array.isArray(args.extractedTerms) ? (args.extractedTerms as any) : [],
            extractionStatus: (args.extractionStatus as any) || "clear",
            idempotencyKey: String(args.idempotencyKey || `obs-${Date.now()}`),
          });

          // Also record into local ledger
          this.ledger.recordEvidenceEvent({
            eventId: res.eventId,
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
            sourceTurnId,
            timestampMs: Number(args.timestampMs) || Date.now(),
            speaker: (args.speaker as "merchant" | "agent") || "merchant",
            sourceText: String(args.sourceText),
            extractedTerms: Array.isArray(args.extractedTerms) ? (args.extractedTerms as any) : [],
            verificationStatus: res.verificationStatus,
          });

          return { toolName: name, success: true, data: res };
        }

        case "request_negotiation_action": {
          const res = await this.backendClient.requestNegotiationAction({
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
            merchantLatestStatement: String(args.merchantLatestStatement),
            proposedUnitPrice: args.proposedUnitPrice !== undefined ? Number(args.proposedUnitPrice) : undefined,
            proposedAction: (args.proposedAction as any) || "counteroffer",
            idempotencyKey: String(args.idempotencyKey || `act-${Date.now()}`),
          });
          return { toolName: name, success: true, data: res };
        }

        case "submit_confirmation_request": {
          const sourceTurnId = String(args.sourceTurnId);
          if (!this.ledger.hasTurn(sourceTurnId)) {
            return {
              toolName: name,
              success: false,
              error: `Action Denied: Confirmation source turn '${sourceTurnId}' was not found in session transcript.`,
            };
          }

          const res = await this.backendClient.submitConfirmationRequest({
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
            sourceTurnId,
            confirmedTerms: Array.isArray(args.confirmedTerms) ? (args.confirmedTerms as string[]) : [],
            merchantConfirmationQuote: String(args.merchantConfirmationQuote),
            idempotencyKey: String(args.idempotencyKey || `conf-${Date.now()}`),
          });
          return { toolName: name, success: true, data: res };
        }

        case "end_negotiation_session": {
          const res = await this.backendClient.endNegotiationSession({
            negotiationId: String(args.negotiationId),
            sessionId: String(args.sessionId),
            reason: (args.reason as any) || "agreement_reached",
            summary: String(args.summary || "Session closed by agent."),
          });
          return { toolName: name, success: true, data: res };
        }

        default:
          return {
            toolName: name,
            success: false,
            error: `Unrecognized tool '${name}'. Permitted tools are: get_negotiation_context, submit_offer_observation, request_negotiation_action, submit_confirmation_request, end_negotiation_session.`,
          };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        toolName: name,
        success: false,
        error: `Tool execution failed: ${msg}`,
      };
    }
  }
}
