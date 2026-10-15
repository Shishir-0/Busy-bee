import { z } from 'zod';
export declare const OFFER_STATUSES: readonly ["proposed", "countered", "merchant_confirmed", "disputed", "incomplete", "rejected", "ready_for_buyer_review"];
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export declare const SESSION_STATUSES: readonly ["created", "connecting", "active", "ended", "failed"];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export declare const EVIDENCE_STATUSES: readonly ["unverified", "partially_verified", "verified", "disputed", "needs_review"];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export declare const RECOMMENDATION_STATUSES: readonly ["not_ready", "provisional", "ready_for_review", "reviewed"];
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];
export declare const POLICY_DECISIONS: readonly ["allowed", "denied", "needs_clarification", "needs_buyer_review", "session_not_active"];
export type PolicyDecision = (typeof POLICY_DECISIONS)[number];
export declare const SPEAKER_ROLES: readonly ["buyer", "merchant", "ai_agent"];
export type SpeakerRole = (typeof SPEAKER_ROLES)[number];
export declare const EVENT_TYPES: readonly ["negotiation.created", "session.started", "session.connected", "session.ended", "transcript.turn", "evidence.recorded", "offer.proposed", "offer.revised", "merchant.confirmed", "policy.denied", "offer.incomplete", "recommendation.calculated"];
export type EventType = (typeof EVENT_TYPES)[number];
export declare const CreateNegotiationSchema: z.ZodObject<{
    objective: z.ZodString;
    quantity: z.ZodNumber;
    currency: z.ZodLiteral<"INR">;
    maxBudget: z.ZodNumber;
    deliveryDeadlineDays: z.ZodNumber;
    minWarrantyMonths: z.ZodNumber;
    mandatorySpecifications: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    counterOfferPolicy: z.ZodDefault<z.ZodObject<{
        maxUnitConcession: z.ZodOptional<z.ZodNumber>;
        allowSplitShipment: z.ZodDefault<z.ZodBoolean>;
        targetUnitPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowSplitShipment: boolean;
        maxUnitConcession?: number | undefined;
        targetUnitPrice?: number | undefined;
    }, {
        maxUnitConcession?: number | undefined;
        allowSplitShipment?: boolean | undefined;
        targetUnitPrice?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    objective: string;
    quantity: number;
    currency: "INR";
    maxBudget: number;
    deliveryDeadlineDays: number;
    minWarrantyMonths: number;
    mandatorySpecifications: string[];
    counterOfferPolicy: {
        allowSplitShipment: boolean;
        maxUnitConcession?: number | undefined;
        targetUnitPrice?: number | undefined;
    };
}, {
    objective: string;
    quantity: number;
    currency: "INR";
    maxBudget: number;
    deliveryDeadlineDays: number;
    minWarrantyMonths: number;
    mandatorySpecifications?: string[] | undefined;
    counterOfferPolicy?: {
        maxUnitConcession?: number | undefined;
        allowSplitShipment?: boolean | undefined;
        targetUnitPrice?: number | undefined;
    } | undefined;
}>;
export type CreateNegotiationInput = z.infer<typeof CreateNegotiationSchema>;
export interface NegotiationMandate extends CreateNegotiationInput {
    id: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}
export declare const CreateSessionSchema: z.ZodObject<{
    merchantName: z.ZodString;
    merchantRole: z.ZodDefault<z.ZodString>;
    contactIdentifier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    merchantName: string;
    merchantRole: string;
    contactIdentifier?: string | undefined;
}, {
    merchantName: string;
    merchantRole?: string | undefined;
    contactIdentifier?: string | undefined;
}>;
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
export declare const LiveKitTokenRequestSchema: z.ZodObject<{
    participantIdentity: z.ZodString;
    participantName: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["buyer", "merchant", "ai_agent"]>;
}, "strip", z.ZodTypeAny, {
    participantIdentity: string;
    role: "buyer" | "merchant" | "ai_agent";
    participantName?: string | undefined;
}, {
    participantIdentity: string;
    role: "buyer" | "merchant" | "ai_agent";
    participantName?: string | undefined;
}>;
export type LiveKitTokenRequest = z.infer<typeof LiveKitTokenRequestSchema>;
export interface LiveKitTokenResponse {
    token: string;
    url: string;
    roomName: string;
    participantIdentity: string;
    expiresInSeconds: number;
}
export declare const ExtractedTermsSchema: z.ZodObject<{
    unitPrice: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodNumber>;
    totalProductPrice: z.ZodOptional<z.ZodNumber>;
    shippingFee: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isShippingIncluded: z.ZodOptional<z.ZodBoolean>;
    taxRatePercent: z.ZodOptional<z.ZodNumber>;
    isTaxIncluded: z.ZodOptional<z.ZodBoolean>;
    additionalFees: z.ZodOptional<z.ZodNumber>;
    deliveryDays: z.ZodOptional<z.ZodNumber>;
    warrantyMonths: z.ZodOptional<z.ZodNumber>;
    paymentTerms: z.ZodOptional<z.ZodString>;
    specifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    merchantNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    unitPrice?: number | undefined;
    totalProductPrice?: number | undefined;
    shippingFee?: number | null | undefined;
    isShippingIncluded?: boolean | undefined;
    taxRatePercent?: number | undefined;
    isTaxIncluded?: boolean | undefined;
    additionalFees?: number | undefined;
    deliveryDays?: number | undefined;
    warrantyMonths?: number | undefined;
    paymentTerms?: string | undefined;
    specifications?: string[] | undefined;
    merchantNotes?: string | undefined;
}, {
    quantity?: number | undefined;
    unitPrice?: number | undefined;
    totalProductPrice?: number | undefined;
    shippingFee?: number | null | undefined;
    isShippingIncluded?: boolean | undefined;
    taxRatePercent?: number | undefined;
    isTaxIncluded?: boolean | undefined;
    additionalFees?: number | undefined;
    deliveryDays?: number | undefined;
    warrantyMonths?: number | undefined;
    paymentTerms?: string | undefined;
    specifications?: string[] | undefined;
    merchantNotes?: string | undefined;
}>;
export type ExtractedTerms = z.infer<typeof ExtractedTermsSchema>;
export declare const ObservationEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    negotiationId: z.ZodString;
    sessionId: z.ZodString;
    sourceTurnId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    speaker: z.ZodEnum<["buyer", "merchant", "ai_agent"]>;
    sourceText: z.ZodString;
    extractedTerms: z.ZodObject<{
        unitPrice: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodOptional<z.ZodNumber>;
        totalProductPrice: z.ZodOptional<z.ZodNumber>;
        shippingFee: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isShippingIncluded: z.ZodOptional<z.ZodBoolean>;
        taxRatePercent: z.ZodOptional<z.ZodNumber>;
        isTaxIncluded: z.ZodOptional<z.ZodBoolean>;
        additionalFees: z.ZodOptional<z.ZodNumber>;
        deliveryDays: z.ZodOptional<z.ZodNumber>;
        warrantyMonths: z.ZodOptional<z.ZodNumber>;
        paymentTerms: z.ZodOptional<z.ZodString>;
        specifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        merchantNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    }, {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    }>;
    claimedVerificationStatus: z.ZodOptional<z.ZodEnum<["unverified", "partially_verified", "verified", "disputed", "needs_review"]>>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    negotiationId: string;
    sessionId: string;
    timestamp: string | number;
    speaker: "buyer" | "merchant" | "ai_agent";
    sourceText: string;
    extractedTerms: {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    };
    sourceTurnId?: string | undefined;
    claimedVerificationStatus?: "disputed" | "unverified" | "partially_verified" | "verified" | "needs_review" | undefined;
}, {
    eventId: string;
    negotiationId: string;
    sessionId: string;
    timestamp: string | number;
    speaker: "buyer" | "merchant" | "ai_agent";
    sourceText: string;
    extractedTerms: {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    };
    sourceTurnId?: string | undefined;
    claimedVerificationStatus?: "disputed" | "unverified" | "partially_verified" | "verified" | "needs_review" | undefined;
}>;
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
export declare const AuthorizeActionSchema: z.ZodObject<{
    actionType: z.ZodEnum<["propose_offer", "counter_offer", "accept_terms", "confirm_merchant_offer"]>;
    proposedTerms: z.ZodObject<{
        unitPrice: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodOptional<z.ZodNumber>;
        totalProductPrice: z.ZodOptional<z.ZodNumber>;
        shippingFee: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isShippingIncluded: z.ZodOptional<z.ZodBoolean>;
        taxRatePercent: z.ZodOptional<z.ZodNumber>;
        isTaxIncluded: z.ZodOptional<z.ZodBoolean>;
        additionalFees: z.ZodOptional<z.ZodNumber>;
        deliveryDays: z.ZodOptional<z.ZodNumber>;
        warrantyMonths: z.ZodOptional<z.ZodNumber>;
        paymentTerms: z.ZodOptional<z.ZodString>;
        specifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        merchantNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    }, {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    }>;
    rationale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    actionType: "propose_offer" | "counter_offer" | "accept_terms" | "confirm_merchant_offer";
    proposedTerms: {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    };
    rationale?: string | undefined;
}, {
    actionType: "propose_offer" | "counter_offer" | "accept_terms" | "confirm_merchant_offer";
    proposedTerms: {
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        totalProductPrice?: number | undefined;
        shippingFee?: number | null | undefined;
        isShippingIncluded?: boolean | undefined;
        taxRatePercent?: number | undefined;
        isTaxIncluded?: boolean | undefined;
        additionalFees?: number | undefined;
        deliveryDays?: number | undefined;
        warrantyMonths?: number | undefined;
        paymentTerms?: string | undefined;
        specifications?: string[] | undefined;
        merchantNotes?: string | undefined;
    };
    rationale?: string | undefined;
}>;
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
export interface SSEEventEnvelope<T = unknown> {
    id: string;
    type: EventType;
    negotiationId: string;
    sessionId?: string;
    offerId?: string;
    timestamp: string;
    data: T;
}
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
//# sourceMappingURL=contracts.d.ts.map