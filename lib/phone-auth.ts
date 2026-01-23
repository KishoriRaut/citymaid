"use server";

import { supabase } from "./supabase";
import { supabaseClient } from "./supabase-client";

// Server-side phone authentication
export async function sendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Format phone number (remove spaces, dashes, etc.)
    const formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Send OTP using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("Error sending OTP:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendPhoneOTP:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyPhoneOTP(phone: string, token: string): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    // Verify OTP using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error in verifyPhoneOTP:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

export async function getCurrentPhoneUser(): Promise<{ user: any; profile: any } | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return { user, profile: null };
    }

    return { user, profile };
  } catch (error) {
    console.error("Error in getCurrentPhoneUser:", error);
    return null;
  }
}

export async function logoutPhoneUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in logoutPhoneUser:", error);
    return { success: false, error: "Failed to sign out" };
  }
}

// Rate limiting for OTP requests (simple implementation)
const otpRequests = new Map<string, { timestamp: number; count: number }>();

export function checkOTPRateLimit(phone: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const key = phone.replace(/[\s\-\(\)]/g, '');
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
  const keysToDelete: string[] = [];
  for (const [key, value] of otpRequests.entries()) {
    if (now - value.timestamp > 300000) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => otpRequests.delete(key));

  return { allowed: true };
}

// Client-side phone authentication
export async function sendPhoneOTPClient(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Format phone number
    const formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check rate limit
    const rateLimit = checkOTPRateLimit(formattedPhone);
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }
    
    // Send OTP
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyPhoneOTPClient(phone: string, token: string): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: "Failed to verify OTP" };
  }
}

export async function getCurrentPhoneUserClient(): Promise<{ user: any; profile: any } | null> {
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return { user, profile: null };
    }

    return { user, profile };
  } catch (error) {
    return null;
  }
}
