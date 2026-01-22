/**
 * Centralized pricing configuration for CityMaid marketplace
 * All pricing values should be referenced from here to ensure consistency
 */

/**
 * Contact unlock price in NPR (Nepalese Rupees)
 * This is the fee users pay to unlock one verified contact number
 */
export const CONTACT_UNLOCK_PRICE = 399;

/**
 * Format price as currency string
 * @param amount - Price amount in NPR
 * @returns Formatted string like "NPR 399"
 */
export function formatPrice(amount: number): string {
  return `NPR ${amount.toLocaleString()}`;
}

/**
 * Get the formatted contact unlock price
 * @returns Formatted string like "NPR 399"
 */
export function getContactUnlockPriceFormatted(): string {
  return formatPrice(CONTACT_UNLOCK_PRICE);
}
