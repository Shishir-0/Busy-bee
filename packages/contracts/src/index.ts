import { z } from "zod";

// ==========================================
// 1. Negotiation Mandate & Configuration
// ==========================================

export const NegotiationMandateSchema = z.object({
  id: z.string().min(1, "Negotiation ID is required"),
  objective: z.string().min(1, "Objective description is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  currency: z.string().default("INR"),
  totalBudget: z.number().positive("Total budget must be positive"),
  maxUnitBudget: z.number().positive("Max unit budget must be positive"),
  targetUnitPrice: z.number().positive("Target unit price must be positive"),
  deliveryDeadlineDays: z.number().int().positive("Delivery deadline days must be positive"),
  minWarrantyMonths: z.number().int().nonnegative("Minimum warranty months must be non-negative"),
  requiredSpecs: z.array(z.string()).default([]),
  maxCounterRounds: z.number().int().positive().default(3),
  permittedConcessions: z.object({
    allowFlexiblePayment: z.boolean().default(false),
    allowVolumeDiscount: z.boolean().default(true),
  }).default({}),
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("active"),
});

export type NegotiationMandate = z.infer<typeof NegotiationMandateSchema>;

// ==========================================
// 2. Session Lifecycle & State
// ==========================================

export const SessionStatusSchema = z.enum([
  "created",
  "connecting",
  "active",
  "ended",
  "failed"
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const MerchantSessionSchema = z.object({
  sessionId: z.string().min(1),
  negotiationId: z.string().min(1),
  merchantName: z.string().min(1),
  roomId: z.string().min(1),
  startedAt: z.number(),
  endedAt: z.number().nullable().default(null),
  status: SessionStatusSchema,
  consentObtained: z.boolean().default(false),
  consentTimestampMs: z.number().nullable().default(null),
  closureReason: z.string().nullable().default(null),
});

export type MerchantSession = z.infer<typeof MerchantSessionSchema>;

// ==========================================
// 3. Offer Terms & States
// ==========================================

export const OfferStatusSchema = z.enum([
  "proposed",
  "countered",
  "merchant_confirmed",
  "disputed",
  "incomplete",
  "rejected",
  "ready_for_buyer_review"
]);
export type OfferStatus = z.infer<typeof OfferStatusSchema>;

export const OfferTermsSchema = z.object({
  unitPrice: z.number().nullable().default(null),
  totalPrice: z.number().nullable().default(null),
  quantity: z.number().int().nullable().default(null),
  currency: z.string().default("INR"),
  shippingCost: z.number().nullable().default(null), // null = unknown/unspecified
  isShippingIncluded: z.boolean().nullable().default(null),
  taxes: z.number().nullable().default(null),
  warrantyMonths: z.number().int().nullable().default(null),
  deliveryDays: z.number().int().nullable().default(null),
  paymentTerms: z.string().nullable().default(null),
  productSpecs: z.string().nullable().default(null),
  status: OfferStatusSchema.default("proposed"),
});

export type OfferTerms = z.infer<typeof OfferTermsSchema>;

// ==========================================
// 4. Evidence Ledger & Provenance
// ==========================================

export const EvidenceVerificationStatusSchema = z.enum([
  "unverified",
  "partially_verified",
  "verified",
  "disputed",
  "needs_review"
]);
export type EvidenceVerificationStatus = z.infer<typeof EvidenceVerificationStatusSchema>;

export const ExtractedTermEntrySchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  isExplicitQuote: z.boolean().default(true),
  isArithmeticInference: z.boolean().default(false),
  status: z.enum(["proposed", "confirmed", "disputed", "unknown"]).default("proposed"),
});
export type ExtractedTermEntry = z.infer<typeof ExtractedTermEntrySchema>;

export const EvidenceEventSchema = z.object({
  eventId: z.string().min(1),
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
  sourceTurnId: z.string().min(1),
  timestampMs: z.number(),
  speaker: z.enum(["merchant", "agent", "system"]),
  sourceText: z.string().min(1, "Source text cannot be empty"),
  extractedTerms: z.array(ExtractedTermEntrySchema),
  verificationStatus: EvidenceVerificationStatusSchema,
  auditNotes: z.string().optional(),
});
export type EvidenceEvent = z.infer<typeof EvidenceEventSchema>;

// ==========================================
// 5. Backend Policy Actions & Decisions
// ==========================================

export const PolicyActionTypeSchema = z.enum([
  "counteroffer_permitted",
  "ask_clarification",
  "collect_missing_terms",
  "stop_negotiating",
  "offer_rejected_by_policy",
  "requires_buyer_review"
]);
export type PolicyActionType = z.infer<typeof PolicyActionTypeSchema>;

export const PolicyDecisionSchema = z.object({
  allowed: z.boolean(),
  action: PolicyActionTypeSchema,
  maxPermittedCounter: z.number().optional(),
  suggestedCounter: z.number().optional(),
  reason: z.string(),
  unresolvedFields: z.array(z.string()).default([]),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

// ==========================================
// 6. Tool-Calling Contracts (Agent <-> Backend)
// ==========================================

// Tool A: get_negotiation_context
export const GetNegotiationContextInputSchema = z.object({
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
});
export type GetNegotiationContextInput = z.infer<typeof GetNegotiationContextInputSchema>;

export const GetNegotiationContextOutputSchema = z.object({
  mandate: NegotiationMandateSchema,
  session: MerchantSessionSchema,
  currentOffer: OfferTermsSchema.nullable(),
  evidenceCount: z.number(),
  roundsCompleted: z.number(),
  maxRounds: z.number(),
});
export type GetNegotiationContextOutput = z.infer<typeof GetNegotiationContextOutputSchema>;

// Tool B: submit_offer_observation
export const SubmitOfferObservationInputSchema = z.object({
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
  sourceTurnId: z.string().min(1),
  timestampMs: z.number(),
  speaker: z.enum(["merchant", "agent"]),
  sourceText: z.string().min(1),
  extractedTerms: z.array(ExtractedTermEntrySchema),
  extractionStatus: z.enum(["clear", "ambiguous", "conflict"]).default("clear"),
  idempotencyKey: z.string().min(1),
});
export type SubmitOfferObservationInput = z.infer<typeof SubmitOfferObservationInputSchema>;

export const SubmitOfferObservationOutputSchema = z.object({
  success: z.boolean(),
  eventId: z.string(),
  offerStatus: OfferStatusSchema,
  verificationStatus: EvidenceVerificationStatusSchema,
  updatedTerms: OfferTermsSchema,
  unresolvedFields: z.array(z.string()),
  message: z.string(),
});
export type SubmitOfferObservationOutput = z.infer<typeof SubmitOfferObservationOutputSchema>;

// Tool C: request_negotiation_action
export const RequestNegotiationActionInputSchema = z.object({
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
  merchantLatestStatement: z.string().min(1),
  proposedUnitPrice: z.number().positive().optional(),
  proposedAction: z.enum(["counteroffer", "clarify", "confirm", "decline"]),
  idempotencyKey: z.string().min(1),
});
export type RequestNegotiationActionInput = z.infer<typeof RequestNegotiationActionInputSchema>;

export const RequestNegotiationActionOutputSchema = z.object({
  decision: PolicyDecisionSchema,
  sessionId: z.string(),
  revision: z.number(),
});
export type RequestNegotiationActionOutput = z.infer<typeof RequestNegotiationActionOutputSchema>;

// Tool D: submit_confirmation_request
export const SubmitConfirmationRequestInputSchema = z.object({
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
  sourceTurnId: z.string().min(1),
  confirmedTerms: z.array(z.string()).min(1),
  merchantConfirmationQuote: z.string().min(1),
  idempotencyKey: z.string().min(1),
});
export type SubmitConfirmationRequestInput = z.infer<typeof SubmitConfirmationRequestInputSchema>;

export const SubmitConfirmationRequestOutputSchema = z.object({
  success: z.boolean(),
  confirmedTerms: z.array(z.string()),
  unresolvedTerms: z.array(z.string()),
  offerStatus: OfferStatusSchema,
  readyForReview: z.boolean(),
  message: z.string(),
});
export type SubmitConfirmationRequestOutput = z.infer<typeof SubmitConfirmationRequestOutputSchema>;

// Tool E: end_negotiation_session
export const EndNegotiationSessionInputSchema = z.object({
  negotiationId: z.string().min(1),
  sessionId: z.string().min(1),
  reason: z.enum([
    "consent_declined",
    "agreement_reached",
    "merchant_declined",
    "budget_exceeded_no_agreement",
    "timeout_reached",
    "error_occurred"
  ]),
  summary: z.string(),
});
export type EndNegotiationSessionInput = z.infer<typeof EndNegotiationSessionInputSchema>;

export const EndNegotiationSessionOutputSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  finalStatus: SessionStatusSchema,
  message: z.string(),
});
export type EndNegotiationSessionOutput = z.infer<typeof EndNegotiationSessionOutputSchema>;

// ==========================================
// 7. Deal Decision & Comparison Entities
// ==========================================

export const LandedCostCalculationSchema = z.object({
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  shippingCost: z.number(),
  isShippingIncluded: z.boolean(),
  taxes: z.number(),
  otherFees: z.number(),
  totalLandedCost: z.number(),
  isComplete: z.boolean(),
  missingComponents: z.array(z.string()),
});
export type LandedCostCalculation = z.infer<typeof LandedCostCalculationSchema>;

export const OfferComparisonItemSchema = z.object({
  merchantName: z.string(),
  sessionId: z.string(),
  terms: OfferTermsSchema,
  calculation: LandedCostCalculationSchema,
  isEligible: z.boolean(),
  exclusionReasons: z.array(z.string()),
  verificationCoverage: z.number(), // percentage of terms verified with evidence
});
export type OfferComparisonItem = z.infer<typeof OfferComparisonItemSchema>;

export const RecommendationSchema = z.object({
  negotiationId: z.string(),
  winnerSessionId: z.string().nullable(),
  winnerMerchantName: z.string().nullable(),
  rankings: z.array(OfferComparisonItemSchema),
  recommendationState: z.enum(["not_ready", "provisional", "ready_for_review", "reviewed"]),
  justification: z.string(),
  unresolvedConditions: z.array(z.string()),
  generatedAt: z.number(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;
