// Helper utilities for handling redirects after authentication

export const REDIRECT_STORAGE_KEY = 'citymaid_redirect_after_login';

export interface RedirectState {
  postId: string;
  timestamp: number;
}

export function storeRedirectForPost(postId: string): void {
  if (typeof window !== 'undefined') {
    const redirectState: RedirectState = {
      postId,
      timestamp: Date.now()
    };
    localStorage.setItem(REDIRECT_STORAGE_KEY, JSON.stringify(redirectState));
  }
}

export function getStoredRedirect(): RedirectState | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(REDIRECT_STORAGE_KEY);
    if (!stored) return null;

    try {
      const redirectState: RedirectState = JSON.parse(stored);
      
      // Check if redirect is still valid (30 minutes)
      const isValid = Date.now() - redirectState.timestamp < 30 * 60 * 1000;
      
      if (isValid) {
        return redirectState;
      } else {
        // Clear expired redirect
        clearStoredRedirect();
        return null;
      }
    } catch {
      // Clear corrupted data
      clearStoredRedirect();
      return null;
    }
  }
  return null;
}

export function clearStoredRedirect(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REDIRECT_STORAGE_KEY);
  }
}

export function getPaymentUrl(postId: string): string {
  return `/unlock/${postId}`;
}

export function getLoginUrl(redirectTo?: string): string {
  if (redirectTo) {
    return `/login?redirect=${encodeURIComponent(redirectTo)}`;
  }
  return '/login';
}
