// Quick check for email configuration
import { supabaseClient } from "./supabase-client";

export async function testEmailConfig() {
  console.log("🔧 Testing Email Configuration...");
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email: "test@example.com",
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.log("❌ Email Configuration Error:");
      console.log("Error:", error.message);
      
      if (error.message?.includes("Email provider is not enabled")) {
        console.log("\n🔧 SOLUTION:");
        console.log("1. Go to Supabase Dashboard → Authentication → Providers");
        console.log("2. Enable Email provider");
        console.log("3. Configure email settings (SMTP, Resend, or Supabase Email)");
        console.log("4. Save and try again");
      }
      
      return { success: false, error: error.message };
    }

    console.log("✅ Email configuration working!");
    return { success: true, data };
    
  } catch (error) {
    console.log("❌ Exception:", error);
    return { success: false, error: "Exception occurred" };
  }
}

// Run this in browser console: testEmailConfig()
export { testEmailConfig as testEmail };
