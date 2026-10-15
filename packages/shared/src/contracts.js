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
];
export const SESSION_STATUSES = [
    'created',
    'connecting',
    'active',
    'ended',
    'failed',
];
export const EVIDENCE_STATUSES = [
    'unverified',
    'partially_verified',
    'verified',
    'disputed',
    'needs_review',
];
export const RECOMMENDATION_STATUSES = [
    'not_ready',
    'provisional',
    'ready_for_review',
    'reviewed',
];
export const POLICY_DECISIONS = [
    'allowed',
    'denied',
    'needs_clarification',
    'needs_buyer_review',
    'session_not_active',
];
export const SPEAKER_ROLES = ['buyer', 'merchant', 'ai_agent'];
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
];
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
// ==========================================
// 3. SCHEMAS & INTERFACES: SESSIONS & TOKENS
// ==========================================
export const CreateSessionSchema = z.object({
    merchantName: z.string().trim().min(2, 'Merchant name is required'),
    merchantRole: z.string().trim().default('sales_representative'),
    contactIdentifier: z.string().trim().optional(),
});
export const LiveKitTokenRequestSchema = z.object({
    participantIdentity: z.string().trim().min(1, 'Participant identity is required'),
    participantName: z.string().trim().optional(),
    role: z.enum(SPEAKER_ROLES),
});
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
//# sourceMappingURL=contracts.js.map