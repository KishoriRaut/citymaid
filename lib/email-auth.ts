// Email authentication utilities (replaces phone-auth.ts)
import { supabaseClient } from "./supabase-client";

// Server-side Supabase client (only import on server)
let supabase: any = null;
if (typeof window === "undefined") {
  // Only import server-side client on server
  const serverSupabase = require("./supabase");
  supabase = serverSupabase.supabase;
}

// Server-side email authentication (DISABLED - OTP authentication has been disabled)
export async function sendEmailMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Server-side authentication not available" };
  }
  
  // Hard guard - prevent any OTP calls
  if (process.env.NODE_ENV === 'development') {
    throw new Error('OTP authentication has been disabled. sendEmailMagicLink() should not be called.');
  }
  
  // In production, return disabled response
  return { success: false, error: "OTP authentication disabled" };
}

// Client-side email authentication (DISABLED - OTP authentication has been disabled)
export async function sendEmailMagicLinkClient(email: string): Promise<{ success: boolean; error?: string }> {
  // Hard guard - prevent any OTP calls
  if (process.env.NODE_ENV === 'development') {
    throw new Error('OTP authentication has been disabled. sendEmailMagicLinkClient() should not be called.');
  }
  
  // In production, return disabled response
  return { success: false, error: "OTP authentication disabled" };
}

// Get current authenticated user (server-side)
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error && error.name === "AuthSessionMissingError") {
      return null;
    }
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error instanceof Error && error.name === "AuthSessionMissingError") {
      return null;
    }
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Get current authenticated user (client-side)
export async function getCurrentUserClient() {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error && error.name === "AuthSessionMissingError") {
      return null;
    }
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error instanceof Error && error.name === "AuthSessionMissingError") {
      return null;
    }
    console.error("Error in getCurrentUserClient:", error);
    return null;
  }
}

// Get current session (server-side)
export async function getCurrentSession() {
  if (!supabase) {
    return null;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error && error.name === "AuthSessionMissingError") {
      return null;
    }
    
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session;
  } catch (error) {
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error instanceof Error && error.name === "AuthSessionMissingError") {
      return null;
    }
    console.error("Error in getCurrentSession:", error);
    return null;
  }
}

// Get current session (client-side)
export async function getCurrentSessionClient() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error && error.name === "AuthSessionMissingError") {
      return null;
    }
    
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session;
  } catch (error) {
    // Silently handle AuthSessionMissingError - this is expected for anonymous users
    if (error instanceof Error && error.name === "AuthSessionMissingError") {
      return null;
    }
    console.error("Error in getCurrentSessionClient:", error);
    return null;
  }
}

// Sign out user (server-side)
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Server-side authentication not available" };
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in signOutUser:", error);
    return { success: false, error: "Failed to sign out" };
  }
}

// Sign out user (client-side)
export async function signOutUserClient(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to sign out" };
  }
}
