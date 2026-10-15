import type { ObservationEventInput, EvidenceStatus } from '../../../../packages/shared/src/contracts.js';
export interface EvidenceValidationResult {
    isValid: boolean;
    authorizedStatus: EvidenceStatus;
    reason: string;
}
/**
 * Validates extracted commercial terms against captured source transcript turns.
 * The backend authorizes verificationStatus; client/LLM claims are untrusted.
 */
export declare function validateEvidenceEvent(event: ObservationEventInput): EvidenceValidationResult;
//# sourceMappingURL=evidenceValidator.d.ts.map