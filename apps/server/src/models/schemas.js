import mongoose, { Schema } from 'mongoose';
// 1. Negotiation Schema
const NegotiationMongooseSchema = new Schema({
    id: { type: String, required: true, unique: true, index: true },
    objective: { type: String, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    maxBudget: { type: Number, required: true },
    deliveryDeadlineDays: { type: Number, required: true },
    minWarrantyMonths: { type: Number, required: true },
    mandatorySpecifications: [{ type: String }],
    counterOfferPolicy: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, required: true, default: 'active' },
}, { timestamps: true });
export const NegotiationModel = mongoose.models.Negotiation ||
    mongoose.model('Negotiation', NegotiationMongooseSchema);
// 2. Session Schema
const SessionMongooseSchema = new Schema({
    id: { type: String, required: true, unique: true, index: true },
    negotiationId: { type: String, required: true, index: true },
    merchantName: { type: String, required: true },
    merchantRole: { type: String, required: true },
    roomId: { type: String, required: true },
    status: { type: String, required: true, default: 'created' },
    startedAt: { type: String },
    endedAt: { type: String },
}, { timestamps: true });
export const SessionModel = mongoose.models.Session || mongoose.model('Session', SessionMongooseSchema);
// 3. Offer Schema
const OfferMongooseSchema = new Schema({
    id: { type: String, required: true, unique: true, index: true },
    negotiationId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    merchantName: { type: String, required: true },
    revision: { type: Number, required: true, default: 1 },
    status: { type: String, required: true },
    terms: { type: Schema.Types.Mixed, required: true },
    costBreakdown: { type: Schema.Types.Mixed, required: true },
    supportingEvidenceIds: [{ type: String }],
}, { timestamps: true });
export const OfferModel = mongoose.models.Offer || mongoose.model('Offer', OfferMongooseSchema);
// 4. Evidence Schema (Unique index on eventId to prevent duplicate insertion)
const EvidenceMongooseSchema = new Schema({
    id: { type: String, required: true, unique: true },
    eventId: { type: String, required: true, unique: true, index: true },
    negotiationId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    sourceTurnId: { type: String },
    timestamp: { type: String, required: true },
    speaker: { type: String, required: true },
    sourceText: { type: String, required: true },
    extractedTerms: { type: Schema.Types.Mixed, required: true },
    verificationStatus: { type: String, required: true },
    verificationReason: { type: String, required: true },
}, { timestamps: true });
export const EvidenceModel = mongoose.models.Evidence || mongoose.model('Evidence', EvidenceMongooseSchema);
// 5. Recommendation Schema
const RecommendationMongooseSchema = new Schema({
    id: { type: String, required: true, unique: true },
    negotiationId: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true },
    winnerOfferId: { type: String, default: null },
    winnerMerchantName: { type: String, default: null },
    eligibleOffers: [{ type: Schema.Types.Mixed }],
    ineligibleOffers: [{ type: Schema.Types.Mixed }],
    unresolvedConditions: [{ type: String }],
    formulaExplanation: { type: String, required: true },
    calculatedAt: { type: String, required: true },
}, { timestamps: true });
export const RecommendationModel = mongoose.models.Recommendation ||
    mongoose.model('Recommendation', RecommendationMongooseSchema);
//# sourceMappingURL=schemas.js.map