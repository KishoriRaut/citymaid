import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create Supabase client with service role key for server-side use
export const supabaseClientServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

// Check if Supabase is configured
export const isSupabaseClientConfigured = !!(supabaseUrl && supabaseAnonKey);
