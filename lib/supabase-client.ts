"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Log configuration status in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase client not configured!");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "MISSING");
    console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "***" + supabaseAnonKey.slice(-10) : "MISSING");
  } else {
    console.log("✅ Supabase client configured");
    console.log("   URL:", supabaseUrl.substring(0, 30) + "...");
  }
}

// Client-side Supabase client for public pages
// Uses anon key for RLS-protected operations
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});
