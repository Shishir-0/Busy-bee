/**
 * The Negotiator • Domain Entities & API Types
 * Aligned with backend contracts, PRD v1.0, and Project Details.
 */

export type Currency = 'INR' | 'USD' | 'EUR';

export type NegotiationStatus = 
  | 'draft' 
  | 'mandate_active' 
  | 'negotiating' 
  | 'offers_received' 
  | 'recommended' 
  | 'completed' 
  | 'cancelled';

export interface NegotiationAuthority {
  targetUnitPrice: number;
  maxUnitPrice: number;
  permittedConcessions: string[];
  strictBudgetCap: boolean;
  maxDeliveryDays: number;
  minWarrantyMonths: number;
}

export interface NegotiationMandate {
  id: string;
  title: string;
  objective: string;
  quantity: number;
  currency: Currency;
  maxBudget: number; // hard total landed cost cap
  deliveryDeadlineDays: number;
  minWarrantyMonths: number;
  mandatorySpecs: string[];
  authority: NegotiationAuthority;
  status: NegotiationStatus;
  createdAt: string;
  updatedAt: string;
}

export type SessionLifecycle = 
  | 'created' 
  | 'connecting' 
  | 'active' 
  | 'ended' 
  | 'failed';

export interface MerchantSession {
  id: string;
  negotiationId: string;
  merchantName: string;
  merchantRepName?: string;
  roomId: string;
  status: SessionLifecycle;
  startedAt?: string;
  endedAt?: string;
  agentDisclosureCompleted: boolean;
  recordingConsentObtained: boolean;
}

export type OfferStatus = 
  | 'proposed' 
  | 'countered' 
  | 'merchant_confirmed' 
  | 'disputed' 
  | 'incomplete' 
  | 'rejected' 
  | 'ready_for_buyer_review';

export interface CommercialTerms {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  taxes: number;
  shippingCost: number | null; // null represents UNKNOWN / UNCONFIRMED, never silently 0!
  additionalFees: number;
  totalLandedCost: number | null; // null if shipping or other material fees are unknown
  deliveryDays: number | null;
  warrantyMonths: number | null;
  paymentTerms?: string;
}

export interface MerchantOffer {
  id: string;
  negotiationId: string;
  sessionId: string;
  merchantName: string;
  revision: number;
  status: OfferStatus;
  terms: CommercialTerms;
  isEligible: boolean;
  ineligibilityReason?: string;
  evidenceIds: string[];
  updatedAt: string;
}

export type EvidenceVerificationStatus = 
  | 'verified' 
  | 'partially_verified' 
  | 'proposed' 
  | 'unverified' 
  | 'disputed' 
  | 'needs_review';

export type TermKey = 
  | 'price' 
  | 'quantity' 
  | 'shipping' 
  | 'taxes' 
  | 'delivery' 
  | 'warranty' 
  | 'payment';

export interface EvidenceItem {
  id: string;
  negotiationId: string;
  sessionId: string;
  sourceTurnId: string;
  timestamp: string;
  speaker: 'merchant' | 'agent' | 'buyer';
  speakerLabel: string;
  transcriptExcerpt: string;
  termKey: TermKey;
  extractedField: string;
  extractedValue: string | number;
  verificationStatus: EvidenceVerificationStatus;
  notes?: string;
}

export interface PolicyViolation {
  id: string;
  negotiationId: string;
  sessionId: string;
  timestamp: string;
  ruleName: string;
  attemptedValue: string | number;
  limitValue: string | number;
  reason: string;
  status: 'blocked_by_guard';
}

export type RecommendationStatus = 
  | 'not_ready' 
  | 'provisional' 
  | 'ready_for_review' 
  | 'reviewed';

export interface LandedCostBreakdownItem {
  label: string;
  amount: number | null;
  isUnknown?: boolean;
  notes?: string;
}

export interface DealRecommendation {
  id: string;
  negotiationId: string;
  status: RecommendationStatus;
  recommendedOfferId: string | null;
  recommendedMerchant: string | null;
  totalLandedCost: number | null;
  budgetRemaining: number | null;
  eligibleOfferIds: string[];
  excludedOffers: Array<{
    offerId: string;
    merchantName: string;
    reason: string;
  }>;
  calculationBreakdown: {
    formula: string;
    items: LandedCostBreakdownItem[];
  };
  reasons: string[];
  supportingEvidenceIds: string[];
  unresolvedConditions: string[];
  buyerReviewAction?: {
    reviewedBy: string;
    approvedAt: string;
    comments: string;
  } | null;
}

export interface TranscriptTurn {
  id: string;
  sessionId: string;
  speaker: 'merchant' | 'agent' | 'system';
  speakerName: string;
  text: string;
  timestamp: string;
  extractedEvidenceId?: string;
  isPolicyWarning?: boolean;
}
