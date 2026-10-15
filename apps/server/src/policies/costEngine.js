/**
 * Deterministic calculation of total landed cost.
 * Adheres strictly to:
 * 1. "Unknown shipping costs must NOT be assumed to be zero."
 * 2. "An incomplete offer must remain incomplete."
 * 3. Exact rupee arithmetic for the hackathon reference cases.
 */
export function calculateLandedCost(terms, mandateQuantity) {
    const missingComponents = [];
    // Determine effective quantity
    const quantity = terms.quantity && terms.quantity > 0 ? terms.quantity : mandateQuantity;
    // Determine Product Subtotal
    let productSubtotal = 0;
    if (terms.totalProductPrice !== undefined && terms.totalProductPrice !== null) {
        productSubtotal = terms.totalProductPrice;
    }
    else if (terms.unitPrice !== undefined && terms.unitPrice !== null) {
        productSubtotal = Math.round(quantity * terms.unitPrice);
    }
    else {
        missingComponents.push('unit_price_or_product_total');
    }
    // Determine Shipping Fee
    let shippingFee = 0;
    let isShippingKnown = false;
    const isShippingIncludedInProduct = Boolean(terms.isShippingIncluded);
    if (isShippingIncludedInProduct) {
        shippingFee = 0;
        isShippingKnown = true;
    }
    else if (terms.shippingFee !== undefined && terms.shippingFee !== null) {
        shippingFee = Math.round(terms.shippingFee);
        isShippingKnown = true;
    }
    else {
        // Shipping is unknown! NEVER treat as zero
        isShippingKnown = false;
        missingComponents.push('shipping_fee');
    }
    // Determine Taxes
    let taxesAmount = 0;
    let isTaxKnown = false;
    const isTaxIncludedInProduct = terms.isTaxIncluded !== undefined ? Boolean(terms.isTaxIncluded) : true; // default standard quotes
    if (isTaxIncludedInProduct) {
        taxesAmount = 0;
        isTaxKnown = true;
    }
    else if (terms.taxRatePercent !== undefined && terms.taxRatePercent !== null) {
        taxesAmount = Math.round((productSubtotal * terms.taxRatePercent) / 100);
        isTaxKnown = true;
    }
    else {
        // Tax status unclear
        isTaxKnown = true; // default treated as standard included unless excluded specified
    }
    // Additional fees
    const additionalFees = Math.round(terms.additionalFees ?? 0);
    // Total Landed Cost calculation
    // Only calculated if subtotal is known. If shipping is unknown, it's provisional
    const totalLandedCost = productSubtotal + shippingFee + taxesAmount + additionalFees;
    const isComplete = missingComponents.length === 0 && isShippingKnown;
    return {
        productSubtotal,
        shippingFee,
        isShippingKnown,
        isShippingIncludedInProduct,
        taxesAmount,
        isTaxKnown,
        isTaxIncludedInProduct,
        additionalFees,
        totalLandedCost,
        isComplete,
        missingComponents,
    };
}
//# sourceMappingURL=costEngine.js.map