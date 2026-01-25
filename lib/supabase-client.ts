"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if required environment variables are available
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Singleton Supabase client for browser
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabaseClient = (() => {
  if (!supabaseInstance && isSupabaseConfigured) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
})();

// Export configuration status
export { isSupabaseConfigured };
