"use client";

import { supabaseClient } from "./supabase-client";

// Send magic link for authentication
export async function sendMagicLink(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabaseClient) {
      return { success: false, error: "Supabase client not initialized" };
    }

    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Magic link error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Magic link error:", error);
    return { success: false, error: "Failed to send magic link" };
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const userStr = localStorage.getItem("user");
    return !!userStr && !!JSON.parse(userStr);
  } catch {
    return false;
  }
}

// Get current authenticated user
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Set user session after magic link authentication
export function setUserSession(user: any) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user session:", error);
  }
}

// Clear user session
export function clearUserSession() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error clearing user session:", error);
  }
}
