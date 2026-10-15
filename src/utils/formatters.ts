import { Currency } from '../types/negotiation';

/**
 * Format currency with locale precision (e.g., Indian numbering for INR: ₹1,50,000)
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: Currency = 'INR'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Unknown / Pending';
  }

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Format timestamp into standard readable time e.g., "14:32:05"
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format timestamp into standard date e.g., "15 Oct 2026"
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format seconds into mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
