/**
 * Unlock Intent Management
 * Persists unlock intent across authentication flow
 */

export interface UnlockIntent {
  postId: string;
  timestamp: number;
  source: 'unlock_contact';
}

const UNLOCK_INTENT_KEY = 'citymaid_unlock_intent';

/**
 * Store unlock intent in sessionStorage
 * Survives across auth redirects
 */
export function storeUnlockIntent(postId: string): void {
  if (typeof window !== 'undefined') {
    try {
      const intent: UnlockIntent = {
        postId,
        timestamp: Date.now(),
        source: 'unlock_contact'
      };
      
      sessionStorage.setItem(UNLOCK_INTENT_KEY, JSON.stringify(intent));
      console.log('🔐 Stored unlock intent:', intent);
    } catch (error) {
      console.warn('Error storing unlock intent:', error);
    }
  }
}

/**
 * Get and clear unlock intent from sessionStorage
 * Returns null if no intent exists or if expired (30 minutes)
 */
export function consumeUnlockIntent(): UnlockIntent | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(UNLOCK_INTENT_KEY);
      if (!stored) return null;
      
      const intent: UnlockIntent = JSON.parse(stored);
      
      // Check if intent is expired (30 minutes)
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - intent.timestamp > thirtyMinutes) {
        sessionStorage.removeItem(UNLOCK_INTENT_KEY);
        return null;
      }
      
      // Remove intent after consuming
      sessionStorage.removeItem(UNLOCK_INTENT_KEY);
      
      console.log('🔓 Consumed unlock intent:', intent);
      return intent;
    } catch (error) {
      console.warn('Error consuming unlock intent:', error);
      sessionStorage.removeItem(UNLOCK_INTENT_KEY);
      return null;
    }
  }
  return null;
}

/**
 * Check if unlock intent exists
 */
export function hasUnlockIntent(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(UNLOCK_INTENT_KEY);
      if (!stored) return false;
      
      const intent: UnlockIntent = JSON.parse(stored);
      
      // Check if intent is expired
      const thirtyMinutes = 30 * 60 * 1000;
      return Date.now() - intent.timestamp <= thirtyMinutes;
    } catch (error) {
      console.warn('Error checking unlock intent:', error);
      return false;
    }
  }
  return false;
}

/**
 * Clear unlock intent
 */
export function clearUnlockIntent(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(UNLOCK_INTENT_KEY);
  }
}
