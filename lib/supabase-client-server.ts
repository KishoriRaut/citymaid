import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client with anon key for server-side use
// This mimics the client-side behavior but works in server environment
export const supabaseClientServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Check if Supabase is configured
export const isSupabaseClientConfigured = !!(supabaseUrl && supabaseAnonKey);
