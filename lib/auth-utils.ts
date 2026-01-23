"use client";

import { supabaseClient } from "./supabase-client";

// Centralized auth utilities to prevent duplication

// Clear Supabase browser storage (singleton pattern)
let hasClearedStorage = false;
export function clearSupabaseStorage() {
  if (typeof window === "undefined" || hasClearedStorage) return;

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('supabase.auth.')) {
      sessionStorage.removeItem(key);
    }
  });

  hasClearedStorage = true;
  console.log('✅ Cleared Supabase browser storage');
}

// Centralized auth state listener management
let authListenerSubscription: any = null;

export function setupAuthListener(callback: (event: string, session: any) => void) {
  // Clean up existing listener
  if (authListenerSubscription) {
    authListenerSubscription.unsubscribe();
  }

  // Set up new listener
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(callback);
  authListenerSubscription = subscription;

  return subscription;
}

export function cleanupAuthListener() {
  if (authListenerSubscription) {
    authListenerSubscription.unsubscribe();
    authListenerSubscription = null;
  }
}

// Check if user is admin (centralized logic)
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = [
    "admin@citymaid.com",
    "kishoriraut@example.com",
  ];
  
  return adminEmails.includes(email) || email.endsWith("@citymaid.com");
}

// Get current session (wrapper for consistency)
export async function getCurrentSession() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  // Silently handle AuthSessionMissingError - this is expected for anonymous users
  if (error && error.name === "AuthSessionMissingError") {
    return { session: null, error };
  }
  
  return { session, error };
}

// Sign in with OTP (DISABLED - OTP authentication has been disabled)
export async function signInWithOTP(email: string, redirectTo?: string) {
  // Hard guard - prevent any OTP calls
  if (process.env.NODE_ENV === 'development') {
    throw new Error('OTP authentication has been disabled. signInWithOTP() should not be called.');
  }
  
  // In production, return a mock response to prevent crashes
  return {
    data: null,
    error: { name: 'AuthDisabled', message: 'OTP authentication disabled' }
  };
}
