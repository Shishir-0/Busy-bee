/**
 * Validates extracted commercial terms against captured source transcript turns.
 * The backend authorizes verificationStatus; client/LLM claims are untrusted.
 */
export function validateEvidenceEvent(event) {
    const { sourceText, extractedTerms, speaker } = event;
    if (!sourceText || sourceText.trim().length === 0) {
        return {
            isValid: false,
            authorizedStatus: 'unverified',
            reason: 'Source transcript turn is missing or empty.',
        };
    }
    // Ensure at least one material term was extracted
    const hasMaterialTerms = extractedTerms.unitPrice !== undefined ||
        extractedTerms.totalProductPrice !== undefined ||
        extractedTerms.shippingFee !== undefined ||
        extractedTerms.isShippingIncluded !== undefined ||
        extractedTerms.deliveryDays !== undefined ||
        extractedTerms.warrantyMonths !== undefined ||
        (extractedTerms.specifications && extractedTerms.specifications.length > 0);
    if (!hasMaterialTerms) {
        return {
            isValid: false,
            authorizedStatus: 'unverified',
            reason: 'No material commercial terms were extracted from this turn.',
        };
    }
    // Corroboration heuristics: Check if numbers or terms in extractedTerms appear in sourceText
    const sourceLower = sourceText.toLowerCase();
    let corroboratedCount = 0;
    let totalChecked = 0;
    if (extractedTerms.unitPrice !== undefined) {
        totalChecked++;
        const priceStr = String(extractedTerms.unitPrice);
        if (sourceLower.includes(priceStr)) {
            corroboratedCount++;
        }
    }
    if (extractedTerms.deliveryDays !== undefined) {
        totalChecked++;
        const daysStr = String(extractedTerms.deliveryDays);
        if (sourceLower.includes(daysStr) || sourceLower.includes('day')) {
            corroboratedCount++;
        }
    }
    if (extractedTerms.warrantyMonths !== undefined) {
        totalChecked++;
        const warStr = String(extractedTerms.warrantyMonths);
        if (sourceLower.includes(warStr) || sourceLower.includes('year') || sourceLower.includes('month') || sourceLower.includes('warranty')) {
            corroboratedCount++;
        }
    }
    if (extractedTerms.isShippingIncluded) {
        totalChecked++;
        if (sourceLower.includes('free') || sourceLower.includes('included') || sourceLower.includes('shipping')) {
            corroboratedCount++;
        }
    }
    else if (extractedTerms.shippingFee !== undefined && extractedTerms.shippingFee !== null) {
        totalChecked++;
        const shipStr = String(extractedTerms.shippingFee);
        if (sourceLower.includes(shipStr) || sourceLower.includes('shipping') || sourceLower.includes('delivery')) {
            corroboratedCount++;
        }
    }
    let authorizedStatus = 'partially_verified';
    let reason = 'Terms partially corroborated against source transcript.';
    if (totalChecked > 0 && corroboratedCount === totalChecked) {
        authorizedStatus = 'verified';
        reason = `All ${totalChecked} extracted terms match spoken merchant statement.`;
    }
    else if (corroboratedCount > 0) {
        authorizedStatus = 'partially_verified';
        reason = `${corroboratedCount} of ${totalChecked} extracted terms matched source text.`;
    }
    else if (speaker === 'merchant') {
        authorizedStatus = 'needs_review';
        reason = 'Spoken merchant statement recorded but numerical terms require verification review.';
    }
    else {
        authorizedStatus = 'unverified';
        reason = 'Spoken statement was not from merchant participant.';
    }
    return {
        isValid: true,
        authorizedStatus,
        reason,
    };
}
//# sourceMappingURL=evidenceValidator.js.map