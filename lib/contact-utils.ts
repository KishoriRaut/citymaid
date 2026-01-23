// Client-side contact utilities
// These functions can be used on both client and server

// Mask phone number utility
export function maskPhoneNumber(phone: string | null): string | null {
  if (!phone || phone.length < 4) {
    return null;
  }
  
  return phone.substring(0, 2) + "*".repeat(phone.length - 4) + phone.substring(phone.length - 2);
}

// Check if phone number is masked
export function isPhoneMasked(phone: string | null): boolean {
  return !phone || phone.includes("*");
}

// Format phone for display
export function formatPhoneDisplay(phone: string | null, canView: boolean): string {
  if (!phone) return "****";
  if (canView) return phone;
  return maskPhoneNumber(phone) || "****";
}
