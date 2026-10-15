export interface ToolDefinition {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties?: boolean;
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    name: "get_negotiation_context",
    description: "Retrieve authorized buyer mandate, current offer terms, and session state from the backend.",
    parameters: {
      type: "object",
      properties: {
        negotiationId: {
          type: "string",
          description: "Unique negotiation identifier."
        },
        sessionId: {
          type: "string",
          description: "Active merchant session identifier."
        }
      },
      required: ["negotiationId", "sessionId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "submit_offer_observation",
    description: "Submit newly stated merchant terms and their structured interpretation for backend evidence ledgering and validation.",
    parameters: {
      type: "object",
      properties: {
        negotiationId: { type: "string" },
        sessionId: { type: "string" },
        sourceTurnId: { 
          type: "string",
          description: "Identifier of the specific audio/transcript turn containing the merchant statement."
        },
        timestampMs: { type: "number", description: "Epoch millisecond timestamp of utterance." },
        speaker: { type: "string", enum: ["merchant", "agent"] },
        sourceText: { 
          type: "string", 
          description: "Exact spoken transcript quote establishing the term."
        },
        extractedTerms: {
          type: "array",
          description: "Structured terms extracted directly from the quote.",
          items: {
            type: "object",
            properties: {
              key: { type: "string", description: "Term key e.g. unitPrice, quantity, shippingCost, warrantyMonths, deliveryDays" },
              value: { description: "The stated value (number, string, or boolean)" },
              isExplicitQuote: { type: "boolean", description: "True if verbatim quote, false if inferred" },
              isArithmeticInference: { type: "boolean", description: "True if computed from other terms" },
              status: { type: "string", enum: ["proposed", "confirmed", "disputed", "unknown"] }
            },
            required: ["key", "value", "isExplicitQuote", "isArithmeticInference", "status"]
          }
        },
        extractionStatus: {
          type: "string",
          enum: ["clear", "ambiguous", "conflict"],
          description: "Clarity of the quote."
        },
        idempotencyKey: {
          type: "string",
          description: "Unique client-generated key preventing duplicate writes on retries."
        }
      },
      required: ["negotiationId", "sessionId", "sourceTurnId", "timestampMs", "speaker", "sourceText", "extractedTerms", "idempotencyKey"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "request_negotiation_action",
    description: "Request backend policy evaluation and authorization BEFORE proposing a monetary counteroffer to the merchant.",
    parameters: {
      type: "object",
      properties: {
        negotiationId: { type: "string" },
        sessionId: { type: "string" },
        merchantLatestStatement: { type: "string", description: "Latest merchant quote being evaluated" },
        proposedUnitPrice: { type: "number", description: "The unit price counter the agent proposes" },
        proposedAction: { 
          type: "string", 
          enum: ["counteroffer", "clarify", "confirm", "decline"],
          description: "Action type the agent seeks approval for" 
        },
        idempotencyKey: { type: "string" }
      },
      required: ["negotiationId", "sessionId", "merchantLatestStatement", "proposedAction", "idempotencyKey"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "submit_confirmation_request",
    description: "Submit merchant's explicit agreement to core terms for validation before advancing offer state.",
    parameters: {
      type: "object",
      properties: {
        negotiationId: { type: "string" },
        sessionId: { type: "string" },
        sourceTurnId: { type: "string" },
        confirmedTerms: { 
          type: "array", 
          items: { type: "string" },
          description: "Keys of terms confirmed (e.g. ['unitPrice', 'warrantyMonths'])" 
        },
        merchantConfirmationQuote: { 
          type: "string",
          description: "Exact merchant words confirming the terms (e.g. 'Yes, ₹2,800 is confirmed with 12 months warranty.')"
        },
        idempotencyKey: { type: "string" }
      },
      required: ["negotiationId", "sessionId", "sourceTurnId", "confirmedTerms", "merchantConfirmationQuote", "idempotencyKey"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "end_negotiation_session",
    description: "Conclude the negotiation session due to agreement, refusal, timeout, or consent denial.",
    parameters: {
      type: "object",
      properties: {
        negotiationId: { type: "string" },
        sessionId: { type: "string" },
        reason: { 
          type: "string", 
          enum: [
            "consent_declined",
            "agreement_reached",
            "merchant_declined",
            "budget_exceeded_no_agreement",
            "timeout_reached",
            "error_occurred"
          ] 
        },
        summary: { type: "string", description: "Concise closing summary of session findings" }
      },
      required: ["negotiationId", "sessionId", "reason", "summary"],
      additionalProperties: false
    }
  }
];
