/**
 * Visitor ID Management
 * Generates and persists a unique visitor ID for tracking contact unlock requests
 * No authentication required
 */

export interface VisitorInfo {
  id: string;
  createdAt: string;
  lastSeen: string;
}

const VISITOR_ID_KEY = 'citymaid_visitor_id';
const VISITOR_INFO_KEY = 'citymaid_visitor_info';

/**
 * Generate a unique visitor ID (UUID v4)
 */
export function generateVisitorId(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create visitor ID from localStorage
 * Persists across sessions
 */
export function getOrCreateVisitorId(): string {
  // Try to get existing visitor info
  if (typeof window !== 'undefined') {
    try {
      const storedInfo = localStorage.getItem(VISITOR_INFO_KEY);
      if (storedInfo) {
        const visitorInfo: VisitorInfo = JSON.parse(storedInfo);
        
        // Update last seen time
        visitorInfo.lastSeen = new Date().toISOString();
        localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify(visitorInfo));
        
        return visitorInfo.id;
      }
    } catch (error) {
      console.warn('Error reading visitor info from localStorage:', error);
    }

    // Create new visitor ID if none exists
    const visitorId = generateVisitorId();
    const visitorInfo: VisitorInfo = {
      id: visitorId,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    try {
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
      localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify(visitorInfo));
    } catch (error) {
      console.warn('Error saving visitor info to localStorage:', error);
    }

    return visitorId;
  }

  // Fallback for server-side rendering
  return generateVisitorId();
}

/**
 * Get existing visitor ID (returns null if none exists)
 */
export function getVisitorId(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const storedInfo = localStorage.getItem(VISITOR_INFO_KEY);
      if (storedInfo) {
        const visitorInfo: VisitorInfo = JSON.parse(storedInfo);
        return visitorInfo.id;
      }
    } catch (error) {
      console.warn('Error reading visitor info from localStorage:', error);
    }
  }
  return null;
}

/**
 * Get full visitor information
 */
export function getVisitorInfo(): VisitorInfo | null {
  if (typeof window !== 'undefined') {
    try {
      const storedInfo = localStorage.getItem(VISITOR_INFO_KEY);
      if (storedInfo) {
        const visitorInfo: VisitorInfo = JSON.parse(storedInfo);
        return visitorInfo;
      }
    } catch (error) {
      console.warn('Error reading visitor info from localStorage:', error);
    }
  }
  return null;
}

/**
 * Update visitor last seen timestamp
 */
export function updateVisitorLastSeen(): void {
  if (typeof window !== 'undefined') {
    try {
      const storedInfo = localStorage.getItem(VISITOR_INFO_KEY);
      if (storedInfo) {
        const visitorInfo: VisitorInfo = JSON.parse(storedInfo);
        visitorInfo.lastSeen = new Date().toISOString();
        localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify(visitorInfo));
      }
    } catch (error) {
      console.warn('Error updating visitor info:', error);
    }
  }
}

/**
 * Reset visitor ID (for testing or manual reset)
 */
export function resetVisitorId(): string {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(VISITOR_ID_KEY);
      localStorage.removeItem(VISITOR_INFO_KEY);
    } catch (error) {
      console.warn('Error clearing visitor info from localStorage:', error);
    }
  }
  return getOrCreateVisitorId();
}
