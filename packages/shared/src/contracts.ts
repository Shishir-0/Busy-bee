import { z } from 'zod';

// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================

export const OFFER_STATUSES = [
  'proposed',
  'countered',
  'merchant_confirmed',
  'disputed',
  'incomplete',
  'rejected',
  'ready_for_buyer_review',
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const SESSION_STATUSES = [
  'created',
  'connecting',
  'active',
  'ended',
  'failed',
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const EVIDENCE_STATUSES = [
  'unverified',
  'partially_verified',
  'verified',
  'disputed',
  'needs_review',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const RECOMMENDATION_STATUSES = [
  'not_ready',
  'provisional',
  'ready_for_review',
  'reviewed',
] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const POLICY_DECISIONS = [
  'allowed',
  'denied',
  'needs_clarification',
  'needs_buyer_review',
  'session_not_active',
] as const;
export type PolicyDecision = (typeof POLICY_DECISIONS)[number];

export const SPEAKER_ROLES = ['buyer', 'merchant', 'ai_agent'] as const;
export type SpeakerRole = (typeof SPEAKER_ROLES)[number];

export const EVENT_TYPES = [
  'negotiation.created',
  'session.started',
  'session.connected',
  'session.ended',
  'transcript.turn',
  'evidence.recorded',
  'offer.proposed',
  'offer.revised',
  'merchant.confirmed',
  'policy.denied',
  'offer.incomplete',
  'recommendation.calculated',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// ==========================================
// 2. SCHEMAS & INTERFACES: NEGOTIATION MANDATE
// ==========================================

export const CreateNegotiationSchema = z.object({
  objective: z.string().trim().min(3, 'Objective must be at least 3 characters'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  currency: z.literal('INR'),
  maxBudget: z.number().positive('Max budget must be a positive number'),
  deliveryDeadlineDays: z.number().int().positive('Delivery deadline must be in positive days'),
  minWarrantyMonths: z.number().int().min(0, 'Minimum warranty must be non-negative months'),
  mandatorySpecifications: z.array(z.string().trim().min(1)).default([]),
  counterOfferPolicy: z
    .object({
      maxUnitConcession: z.number().min(0).optional(),
      allowSplitShipment: z.boolean().default(false),
      targetUnitPrice: z.number().positive().optional(),
    })
    .default({}),
});

export type CreateNegotiationInput = z.infer<typeof CreateNegotiationSchema>;

export interface NegotiationMandate extends CreateNegotiationInput {
  id: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. SCHEMAS & INTERFACES: SESSIONS & TOKENS
// ==========================================

export const CreateSessionSchema = z.object({
  merchantName: z.string().trim().min(2, 'Merchant name is required'),
  merchantRole: z.string().trim().default('sales_representative'),
  contactIdentifier: z.string().trim().optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

export interface MerchantSession {
  id: string;
  negotiationId: string;
  merchantName: string;
  merchantRole: string;
  roomId: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const LiveKitTokenRequestSchema = z.object({
  participantIdentity: z.string().trim().min(1).optional(),
  identity: z.string().trim().min(1).optional(),
  participantName: z.string().trim().optional(),
  role: z.enum(SPEAKER_ROLES).default('merchant'),
}).transform((data) => ({
  participantIdentity: data.participantIdentity || data.identity || `user-${Date.now()}`,
  participantName: data.participantName,
  role: data.role || 'merchant',
}));

export type LiveKitTokenRequest = z.infer<typeof LiveKitTokenRequestSchema>;

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
  participantIdentity: string;
  expiresInSeconds: number;
}

// ==========================================
// 4. EVIDENCE & PROVENANCE
// ==========================================

export const ExtractedTermsSchema = z.object({
  unitPrice: z.number().min(0).optional(),
  quantity: z.number().int().positive().optional(),
  totalProductPrice: z.number().min(0).optional(),
  // shippingFee: null explicitly indicates unknown; undefined means not stated
  shippingFee: z.number().min(0).nullable().optional(),
  isShippingIncluded: z.boolean().optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
  isTaxIncluded: z.boolean().optional(),
  additionalFees: z.number().min(0).optional(),
  deliveryDays: z.number().int().positive().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  paymentTerms: z.string().trim().optional(),
  specifications: z.array(z.string().trim()).optional(),
  merchantNotes: z.string().trim().optional(),
});

export type ExtractedTerms = z.infer<typeof ExtractedTermsSchema>;

export const ObservationEventSchema = z.object({
  eventId: z.string().trim().min(1, 'Event ID is required'),
  negotiationId: z.string().trim().min(1, 'Negotiation ID is required'),
  sessionId: z.string().trim().min(1, 'Session ID is required'),
  sourceTurnId: z.string().trim().optional(),
  timestamp: z.string().datetime().or(z.number()),
  speaker: z.enum(SPEAKER_ROLES),
  sourceText: z.string().trim().min(1, 'Source transcript turn text is required'),
  extractedTerms: ExtractedTermsSchema,
  claimedVerificationStatus: z.enum(EVIDENCE_STATUSES).optional(),
});

export type ObservationEventInput = z.infer<typeof ObservationEventSchema>;

export interface EvidenceRecord {
  id: string;
  eventId: string;
  negotiationId: string;
  sessionId: string;
  sourceTurnId?: string;
  timestamp: string;
  speaker: SpeakerRole;
  sourceText: string;
  extractedTerms: ExtractedTerms;
  verificationStatus: EvidenceStatus;
  verificationReason: string;
  createdAt: string;
}

// ==========================================
// 5. NEGOTIATION POLICY & AUTHORIZATION
// ==========================================

export const AuthorizeActionSchema = z.object({
  actionType: z.enum([
    'propose_offer',
    'counter_offer',
    'accept_terms',
    'confirm_merchant_offer',
  ]),
  proposedTerms: ExtractedTermsSchema,
  rationale: z.string().trim().optional(),
});

export type AuthorizeActionInput = z.infer<typeof AuthorizeActionSchema>;

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  isAllowed: boolean;
  denialCode?: string;
  reason: string;
  violations: string[];
  calculatedTotalCost?: number;
  isCostProvisional: boolean;
  permittedNextActions: string[];
}

// ==========================================
// 6. OFFERS & LANDED COST
// ==========================================

export interface LandedCostBreakdown {
  productSubtotal: number;
  shippingFee: number;
  isShippingKnown: boolean;
  isShippingIncludedInProduct: boolean;
  taxesAmount: number;
  isTaxKnown: boolean;
  isTaxIncludedInProduct: boolean;
  additionalFees: number;
  totalLandedCost: number;
  isComplete: boolean;
  missingComponents: string[];
}

export interface OfferRecord {
  id: string;
  negotiationId: string;
  sessionId: string;
  merchantName: string;
  revision: number;
  status: OfferStatus;
  terms: ExtractedTerms;
  costBreakdown: LandedCostBreakdown;
  supportingEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. RECOMMENDATION ENGINE
// ==========================================

export interface OfferEvaluation {
  offerId: string;
  merchantName: string;
  isEligible: boolean;
  exclusionReasons: string[];
  costBreakdown: LandedCostBreakdown;
  terms: ExtractedTerms;
  verifiedEvidenceCount: number;
}

export interface RecommendationRecord {
  id: string;
  negotiationId: string;
  status: RecommendationStatus;
  winnerOfferId: string | null;
  winnerMerchantName: string | null;
  eligibleOffers: OfferEvaluation[];
  ineligibleOffers: OfferEvaluation[];
  unresolvedConditions: string[];
  formulaExplanation: string;
  calculatedAt: string;
}

// ==========================================
// 8. SERVER-SENT EVENTS
// ==========================================

export interface SSEEventEnvelope<T = unknown> {
  id: string;
  type: EventType;
  negotiationId: string;
  sessionId?: string;
  offerId?: string;
  timestamp: string;
  data: T;
}

// ==========================================
// 9. API ERROR ENVELOPE
// ==========================================

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
  };
}
