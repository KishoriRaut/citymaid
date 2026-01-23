// Email authentication utilities (replaces phone-auth.ts)
import { supabaseClient } from "./supabase-client";

// Server-side Supabase client (only import on server)
let supabase: any = null;
if (typeof window === "undefined") {
  // Only import server-side client on server
  const serverSupabase = require("./supabase");
  supabase = serverSupabase.supabase;
}

// Server-side email authentication
export async function sendEmailMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Server-side authentication not available" };
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendEmailMagicLink:", error);
    return { success: false, error: "Failed to send magic link" };
  }
}

// Client-side email authentication
export async function sendEmailMagicLinkClient(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send magic link" };
  }
}

// Get current authenticated user (server-side)
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Get current authenticated user (client-side)
export async function getCurrentUserClient() {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
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
    
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error in getCurrentSession:", error);
    return null;
  }
}

// Get current session (client-side)
export async function getCurrentSessionClient() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session;
  } catch (error) {
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
