// Client-side rate limiting for OTP requests
const otpRequests = new Map<string, { timestamp: number; count: number }>();

export function checkOTPRateLimit(phone: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  // Remove all non-digits including + sign for consistent key generation
  const key = phone.replace(/[^0-9]/g, '');
  const lastRequest = otpRequests.get(key);

  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest.timestamp;
    
    // Allow 1 OTP per 60 seconds
    if (timeSinceLastRequest < 60000) {
      return { allowed: false, error: "Please wait 60 seconds before requesting another OTP" };
    }
  }

  // Update rate limit tracker
  otpRequests.set(key, { timestamp: now, count: 1 });
  
  // Clean up old entries (older than 5 minutes)
  const nowForCleanup = Date.now();
  otpRequests.forEach((value, key) => {
    if (nowForCleanup - value.timestamp > 300000) {
      otpRequests.delete(key);
    }
  });

  return { allowed: true };
}
