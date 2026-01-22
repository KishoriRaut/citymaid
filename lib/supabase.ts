import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

// Log environment variable status (only in development)
if (process.env.NODE_ENV === "development") {
  if (!isSupabaseConfigured) {
    console.error("❌ Supabase environment variables are NOT loaded!");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "MISSING");
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "***" + supabaseServiceKey.slice(-10) : "MISSING");
    console.error("");
    console.error("📝 SOLUTION:");
    console.error("   1. Create/check .env.local file in: citymaid/.env.local");
    console.error("   2. Add these lines (NO spaces around =):");
    console.error("      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
    console.error("      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
    console.error("   3. RESTART the dev server (Ctrl+C then npm run dev)");
    console.error("   4. Next.js ONLY loads .env.local on startup!");
  } else {
    console.log("✅ Supabase environment variables loaded successfully");
    console.log("   URL:", supabaseUrl.substring(0, 30) + "...");
    console.log("   Key:", supabaseServiceKey.substring(0, 20) + "...");
  }
}

// Create Supabase client with service role key for server-side operations
// Use dummy values if not configured to prevent errors
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
