// Debug utility to test OTP functionality
import { supabaseClient } from "./supabase-client";
import { checkOTPRateLimit } from "./rate-limit";

export async function debugOTPSystem(phone: string) {
  console.log("🔍 Starting OTP Debug Analysis...");
  console.log("=====================================");
  
  // Step 1: Check phone number format
  console.log("📱 Step 1: Phone Number Analysis");
  console.log("Original phone:", phone);
  const formattedPhone = phone.replace(/[^0-9]/g, '');
  console.log("Formatted phone:", formattedPhone);
  
  const finalPhone = formattedPhone.startsWith('977') || formattedPhone.startsWith('1') 
    ? `+${formattedPhone}` 
    : formattedPhone;
  console.log("Final phone for Supabase:", finalPhone);
  console.log("");
  
  // Step 2: Check rate limiting
  console.log("⏱️ Step 2: Rate Limit Check");
  const rateLimit = checkOTPRateLimit(formattedPhone);
  console.log("Rate limit allowed:", rateLimit.allowed);
  if (!rateLimit.allowed) {
    console.log("Rate limit error:", rateLimit.error);
    return { success: false, error: rateLimit.error, stage: "rate_limit" };
  }
  console.log("✅ Rate limit check passed");
  console.log("");
  
  // Step 3: Check Supabase client configuration
  console.log("🔧 Step 3: Supabase Client Check");
  console.log("Supabase URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log("Supabase client initialized:", !!supabaseClient);
  console.log("");
  
  // Step 4: Test Supabase OTP call
  console.log("📤 Step 4: Supabase OTP Call");
  try {
    console.log("Calling supabaseClient.auth.signInWithOtp...");
    console.log("Phone being sent:", finalPhone);
    
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone: finalPhone,
      options: {
        shouldCreateUser: true,
      },
    });
    
    console.log("Supabase response:");
    console.log("Data:", data);
    console.log("Error:", error);
    
    if (error) {
      console.log("❌ Supabase error details:");
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Error code:", error.__isAuthError ? "Auth Error" : "Other Error");
      
      // Analyze specific error types
      if (error.message?.includes("SMS provider")) {
        return { 
          success: false, 
          error: "SMS provider not configured in Supabase", 
          stage: "sms_provider",
          details: "Go to Supabase Dashboard → Authentication → Providers → Phone → Configure SMS gateway"
        };
      }
      
      if (error.message?.includes("Invalid phone")) {
        return { 
          success: false, 
          error: "Invalid phone number format", 
          stage: "phone_format",
          details: "Phone number format is not accepted by Supabase"
        };
      }
      
      if (error.status === 429) {
        return { 
          success: false, 
          error: "Too many requests", 
          stage: "supabase_rate_limit",
          details: "Supabase rate limit exceeded"
        };
      }
      
      return { 
        success: false, 
        error: error.message, 
        stage: "supabase_error",
        details: error
      };
    }
    
    console.log("✅ OTP sent successfully!");
    return { success: true, stage: "success", data };
    
  } catch (catchError) {
    console.log("❌ Exception caught:", catchError);
    return { 
      success: false, 
      error: "Exception during OTP send", 
      stage: "exception",
      details: catchError
    };
  }
}

// Test function to run in browser console
export function runOTPDebugTest() {
  const testPhone = "+9779841234567"; // Nepal format test
  console.log("🧪 Running OTP Debug Test with phone:", testPhone);
  debugOTPSystem(testPhone);
}
