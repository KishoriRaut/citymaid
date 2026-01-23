"use server";

import { supabase } from "./supabase";
import { supabaseClient } from "./supabase-client";

// Server-side phone authentication
export async function sendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Format phone number - remove all non-digits for Supabase
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    
    // Send OTP using Supabase Auth with country code
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone.startsWith('977') || formattedPhone.startsWith('1') 
        ? `+${formattedPhone}` 
        : formattedPhone,
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
    // Format phone number - remove all non-digits for Supabase
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    
    // Verify OTP using Supabase Auth with country code
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone.startsWith('977') || formattedPhone.startsWith('1') 
        ? `+${formattedPhone}` 
        : formattedPhone,
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

// Client-side phone authentication
export async function sendPhoneOTPClient(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Format phone number - remove all non-digits for Supabase
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    
    // Import and check rate limit
    const { checkOTPRateLimit } = await import("./rate-limit");
    const rateLimit = checkOTPRateLimit(formattedPhone);
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }
    
    // Send OTP with country code
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone: formattedPhone.startsWith('977') || formattedPhone.startsWith('1') 
        ? `+${formattedPhone}` 
        : formattedPhone,
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
    // Format phone number - remove all non-digits for Supabase
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone: formattedPhone.startsWith('977') || formattedPhone.startsWith('1') 
        ? `+${formattedPhone}` 
        : formattedPhone,
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
