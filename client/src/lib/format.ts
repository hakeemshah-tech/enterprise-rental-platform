/**
 * Format a number as AED currency.
 * Uses Intl.NumberFormat for proper locale formatting.
 *
 * @example formatAED(1500) → "AED 1,500"
 * @example formatAED(1500.50) → "AED 1,500.50"
 */
export function formatAED(amount: number | undefined | null): string {
    if (amount == null || isNaN(amount)) return 'AED 0';
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}
