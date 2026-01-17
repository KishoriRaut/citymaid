/**
 * Validation utilities for the application
 */

// Email validation regex - defined once for consistency
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate password length
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

/**
 * Validate required fields
 */
export function isRequired(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim() !== "";
}
