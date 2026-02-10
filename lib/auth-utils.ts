"use client";

import { getCurrentUser } from "./session";

// Admin emails - should match your database admin users
const ADMIN_EMAILS = [
  "admin@citymaid.com",
  "kishoriraut.dev@gmail.com"
];

/**
 * Check if user email is admin
 */
export function isAdminUser(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get current session from Supabase
 */
export async function getCurrentSession(): Promise<{ session: {
  user: {
    id: string;
    email: string;
    role: string;
  }
} | null }> {
  try {
    const user = getCurrentUser();
    return { 
      session: user ? {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      } : null 
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return { session: null };
  }
}

/**
 * Setup auth state listener
 */
export function setupAuthListener(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: {
  user: {
    id: string;
    email: string;
    role: string;
  }
} | null) => void) {
  // Since we're using localStorage-based auth, we don't need Supabase auth listeners
  // This is a placeholder that returns a mock subscription
  const subscription = {
    unsubscribe: () => {
      // Cleanup function
    }
  };
  
  // Immediately call callback with current session
  getCurrentSession().then(({ session }) => {
    callback('SIGNED_IN', session);
  });
  
  return subscription;
}

/**
 * Cleanup auth listener
 */
export function cleanupAuthListener() {
  // Cleanup function for localStorage-based auth
  // No-op for now since we don't have active listeners
}
