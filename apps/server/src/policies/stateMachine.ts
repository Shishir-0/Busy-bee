import type { OfferStatus, SessionStatus } from '../../../../packages/shared/src/contracts.js';

const VALID_OFFER_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  proposed: ['countered', 'merchant_confirmed', 'disputed', 'incomplete', 'rejected'],
  countered: ['proposed', 'merchant_confirmed', 'disputed', 'rejected'],
  merchant_confirmed: ['ready_for_buyer_review', 'disputed', 'rejected'],
  disputed: ['proposed', 'countered', 'rejected'],
  incomplete: ['proposed', 'countered', 'rejected'],
  rejected: [],
  ready_for_buyer_review: ['merchant_confirmed', 'rejected'],
};

export function canTransitionOffer(currentStatus: OfferStatus, targetStatus: OfferStatus): boolean {
  if (currentStatus === targetStatus) {
    return true; // Idempotent same-state
  }
  const allowed = VALID_OFFER_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

const VALID_SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  created: ['connecting', 'active', 'failed'],
  connecting: ['active', 'failed'],
  active: ['ended', 'failed'],
  ended: [],
  failed: [],
};

export function canTransitionSession(currentStatus: SessionStatus, targetStatus: SessionStatus): boolean {
  if (currentStatus === targetStatus) {
    return true;
  }
  const allowed = VALID_SESSION_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}
