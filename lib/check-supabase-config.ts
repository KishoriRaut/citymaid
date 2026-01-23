// Check Supabase configuration and SMS provider status
import { supabaseClient } from "./supabase-client";

export async function checkSupabaseConfig() {
  console.log("🔧 Checking Supabase Configuration...");
  console.log("=====================================");
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log("Environment Variables:");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: "Missing Supabase environment variables",
      details: {
        url: !!supabaseUrl,
        anonKey: !!supabaseAnonKey
      }
    };
  }
  
  // Test Supabase connection
  try {
    console.log("\n🔗 Testing Supabase Connection...");
    
    // Test basic connection by trying to get session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.log("❌ Session check failed:", sessionError.message);
      return {
        success: false,
        error: "Supabase connection failed",
        details: sessionError.message
      };
    }
    
    console.log("✅ Supabase connection successful");
    
    // Test if phone auth is enabled by checking available methods
    console.log("\n📱 Checking Phone Auth Availability...");
    
    // Try to get auth settings (this might not be available in all Supabase versions)
    try {
      const { data: settings } = await supabaseClient.auth.getUser();
      console.log("✅ Auth system responsive");
    } catch (settingsError) {
      console.log("⚠️ Could not check auth settings:", settingsError);
    }
    
    // The real test: try to send OTP (this will reveal SMS provider status)
    console.log("\n📤 Testing OTP Send (this will reveal SMS provider status)...");
    
    const testPhone = "+1234567890"; // Test number
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone: testPhone,
      options: {
        shouldCreateUser: true,
      },
    });
    
    if (error) {
      console.log("❌ OTP send failed:", error.message);
      
      // Analyze the error to determine the real issue
      if (error.message?.toLowerCase().includes("sms") || 
          error.message?.toLowerCase().includes("provider") ||
          error.message?.toLowerCase().includes("twilio")) {
        return {
          success: false,
          error: "SMS provider not configured",
          details: {
            message: error.message,
            solution: "Go to Supabase Dashboard → Authentication → Providers → Phone → Configure SMS gateway (Twilio, MessageBird, etc.)"
          }
        };
      }
      
      if (error.message?.toLowerCase().includes("phone") && 
          error.message?.toLowerCase().includes("invalid")) {
        return {
          success: false,
          error: "Phone auth not enabled or invalid format",
          details: {
            message: error.message,
            solution: "Enable Phone provider in Supabase Dashboard → Authentication → Providers"
          }
        };
      }
      
      return {
        success: false,
        error: "OTP send failed",
        details: error.message
      };
    }
    
    console.log("✅ OTP send successful (SMS provider is configured)");
    return {
      success: true,
      message: "Supabase configuration is correct and SMS provider is working"
    };
    
  } catch (error) {
    console.log("❌ Exception during configuration check:", error);
    return {
      success: false,
      error: "Exception during configuration check",
      details: error
    };
  }
}

// Function to run in browser console
export async function quickSupabaseCheck() {
  console.log("🚀 Running Quick Supabase Check...");
  const result = await checkSupabaseConfig();
  console.log("Result:", result);
  return result;
}
