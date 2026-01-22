import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mask contact number (utility function for client and server)
// Security-focused: Show fewer digits to prevent guessing while remaining readable
// Examples: 98****78 (10 digits), 98****5 (7 digits), 98****2 (4 digits)
export function maskContact(contact: string): string {
  if (!contact || contact.length < 4) return "****";
  
  // Count only digits for length calculation
  const digitsOnly = contact.replace(/\D/g, "");
  const digitLength = digitsOnly.length;
  
  // Security-focused masking: Show fewer digits to prevent guessing
  // Industry best practice: Show enough to identify format but not enough to guess
  // 10+ digits: Show first 2-3 and last 2 (leaves 5-6 digits masked = 100K-1M combinations)
  // 7-9 digits: Show first 2 and last 2 (leaves 3-4 digits masked = 1K-10K combinations)
  // 4-6 digits: Show first 2 and last 1 (leaves 1-2 digits masked = 10-100 combinations)
  let startDigits: number;
  let endDigits: number;
  
  if (digitLength >= 10) {
    // Long numbers (phone numbers): Show first 2-3 and last 2
    // This leaves 5-6 digits masked (100,000 to 1,000,000 combinations to guess)
    startDigits = digitLength >= 12 ? 3 : 2;
    endDigits = 2;
  } else if (digitLength >= 7) {
    // Medium numbers: Show first 2 and last 2
    // This leaves 3-4 digits masked (1,000 to 10,000 combinations)
    startDigits = 2;
    endDigits = 2;
  } else {
    // Short numbers: Show first 2 and last 1
    // This leaves 1-2 digits masked (10 to 100 combinations)
    startDigits = 2;
    endDigits = 1;
  }
  
  // Extract digits and mask
  const digits = contact.replace(/\D/g, "");
  const start = digits.slice(0, startDigits);
  const end = digits.slice(-endDigits);
  const maskedLength = digitLength - startDigits - endDigits;
  const masked = "*".repeat(Math.max(3, maskedLength)); // Minimum 3 asterisks for readability
  
  // Preserve country code prefix if present (e.g., +977, +1, 00977)
  const countryCodeMatch = contact.match(/^(\+?\d{1,4}\s?)/);
  if (countryCodeMatch) {
    const countryCode = countryCodeMatch[1].trim();
    return `${countryCode} ${start}${masked}${end}`;
  }
  
  return `${start}${masked}${end}`;
}
