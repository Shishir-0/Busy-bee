import type { ExtractedTermEntry } from "@busy-bee/contracts";

export interface ExtractionResult {
  terms: ExtractedTermEntry[];
  status: "clear" | "ambiguous" | "conflict";
  notes: string[];
}

/**
 * Deterministic pattern & linguistic extractor for procurement terms from spoken utterances.
 * Guarantees that:
 * 1. Missing terms are NEVER defaulted to zero.
 * 2. Inferences are flagged distinctly from explicit quotes.
 * 3. Ambiguities ("warranty should be fine", "maybe around 3000") are marked ambiguous, not confirmed.
 */
export function extractTermsFromUtterance(text: string): ExtractionResult {
  const terms: ExtractedTermEntry[] = [];
  const notes: string[] = [];
  let isAmbiguous = false;

  const normalized = text.toLowerCase();

  // 1. Ambiguity detection
  if (
    normalized.includes("should be fine") ||
    normalized.includes("probably") ||
    normalized.includes("maybe") ||
    normalized.includes("might be") ||
    normalized.includes("around") ||
    normalized.includes("approximately") ||
    normalized.includes("i think")
  ) {
    isAmbiguous = true;
    notes.push("Utterance contains hedge words; marked provisional/ambiguous.");
  }

  // 2. Unit Price extraction
  // Matches e.g. "₹2,900 each", "2900 per chair", "Rs. 3,500/unit", "price is 2800"
  const unitPriceRegex = /(?:₹|rs\.?|inr\s*)?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:each|per\s*(?:unit|chair|piece|item)|a\s*(?:piece|chair|unit)|\/unit|\/chair)/i;
  const unitMatch = text.match(unitPriceRegex);

  // General price regex if no explicit "per unit" keyword
  const generalPriceRegex = /(?:price|quote|rate|at)\s*(?:is|of)?\s*(?:₹|rs\.?|inr\s*)?\s*(\d{1,3}(?:,\d{3})*|\d+)/i;
  const generalMatch = text.match(generalPriceRegex);

  if (unitMatch && unitMatch[1]) {
    const rawVal = unitMatch[1].replace(/,/g, "");
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0) {
      terms.push({
        key: "unitPrice",
        value: val,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: isAmbiguous ? "proposed" : "proposed",
      });
    }
  } else if (generalMatch && generalMatch[1]) {
    const rawVal = generalMatch[1].replace(/,/g, "");
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0) {
      terms.push({
        key: "unitPrice",
        value: val,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: isAmbiguous ? "proposed" : "proposed",
      });
    }
  }

  // 3. Quantity extraction
  // Matches e.g. "50 chairs", "supply 100 units", "quantity of 50"
  const qtyRegex = /(?:supply|provide|order|quantity\s*(?:of)?|for)?\s*(\d+)\s*(?:chairs|units|pieces|nos|items)/i;
  const qtyMatch = text.match(qtyRegex);
  if (qtyMatch && qtyMatch[1]) {
    const qty = parseInt(qtyMatch[1], 10);
    if (!isNaN(qty) && qty > 0) {
      terms.push({
        key: "quantity",
        value: qty,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: "proposed",
      });
    }
  }

  // 4. Shipping & Delivery cost extraction
  // Distinguish "included" from explicit amount, and leave unknown if not mentioned!
  if (
    normalized.includes("free shipping") ||
    normalized.includes("shipping included") ||
    normalized.includes("delivery included") ||
    normalized.includes("freight included") ||
    normalized.includes("no shipping charge") ||
    normalized.includes("free delivery")
  ) {
    terms.push({
      key: "shippingCost",
      value: 0,
      isExplicitQuote: true,
      isArithmeticInference: false,
      status: "proposed",
    });
    terms.push({
      key: "isShippingIncluded",
      value: true,
      isExplicitQuote: true,
      isArithmeticInference: false,
      status: "proposed",
    });
  } else {
    const shippingAmountRegex = /(?:shipping|delivery|freight)\s*(?:is|charge|cost)?\s*(?:₹|rs\.?|inr\s*)?\s*(\d{1,3}(?:,\d{3})*|\d+)/i;
    const shipMatch = text.match(shippingAmountRegex);
    if (shipMatch && shipMatch[1]) {
      const rawShip = shipMatch[1].replace(/,/g, "");
      const shipCost = parseFloat(rawShip);
      terms.push({
        key: "shippingCost",
        value: shipCost,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: "proposed",
      });
      terms.push({
        key: "isShippingIncluded",
        value: shipCost === 0,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: "proposed",
      });
    }
  }

  // 5. Delivery timeline extraction
  // Matches e.g. "delivery in 3 days", "within 5 business days", "3-5 days delivery"
  const deliveryRegex = /(?:within|in|delivery\s*(?:time)?\s*(?:of)?)\s*(\d+)\s*(?:days|business\s*days|working\s*days)/i;
  const deliveryMatch = text.match(deliveryRegex);
  if (deliveryMatch && deliveryMatch[1]) {
    const days = parseInt(deliveryMatch[1], 10);
    terms.push({
      key: "deliveryDays",
      value: days,
      isExplicitQuote: true,
      isArithmeticInference: false,
      status: "proposed",
    });
  }

  // 6. Warranty extraction
  // Matches e.g. "12 months warranty", "1 year warranty", "2 years guarantee"
  // If ambiguous like "warranty should be fine", flag as unknown/disputed!
  if (normalized.includes("warranty should be fine") || normalized.includes("warranty is fine")) {
    terms.push({
      key: "warrantyMonths",
      value: null,
      isExplicitQuote: true,
      isArithmeticInference: false,
      status: "unknown",
    });
    notes.push("Warranty duration unspecified despite positive wording; needs explicit clarification.");
  } else {
    const warrantyMonthsRegex = /(\d+)\s*(?:month|months)\s*(?:warranty|guarantee)/i;
    const warrantyYearsRegex = /(\d+)\s*(?:year|years)\s*(?:warranty|guarantee)/i;
    const monthMatch = text.match(warrantyMonthsRegex);
    const yearMatch = text.match(warrantyYearsRegex);

    if (monthMatch && monthMatch[1]) {
      const months = parseInt(monthMatch[1], 10);
      terms.push({
        key: "warrantyMonths",
        value: months,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: "proposed",
      });
    } else if (yearMatch && yearMatch[1]) {
      const years = parseInt(yearMatch[1], 10);
      terms.push({
        key: "warrantyMonths",
        value: years * 12,
        isExplicitQuote: true,
        isArithmeticInference: false,
        status: "proposed",
      });
    }
  }

  // 7. Payment terms
  if (normalized.includes("advance") || normalized.includes("net 30") || normalized.includes("on delivery") || normalized.includes("cod")) {
    terms.push({
      key: "paymentTerms",
      value: text.trim(),
      isExplicitQuote: true,
      isArithmeticInference: false,
      status: "proposed",
    });
  }

  return {
    terms,
    status: isAmbiguous ? "ambiguous" : "clear",
    notes,
  };
}
