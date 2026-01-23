"use client";

// Clear all Supabase-related browser storage to prevent multiple GoTrueClient issues
export function clearSupabaseStorage() {
  if (typeof window === "undefined") return;

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('supabase.auth.')) {
      sessionStorage.removeItem(key);
    }
  });

  console.log('✅ Cleared Supabase browser storage');
}

// Clear all browser storage (more aggressive cleanup)
export function clearAllBrowserStorage() {
  if (typeof window === "undefined") return;

  localStorage.clear();
  sessionStorage.clear();
  
  console.log('✅ Cleared all browser storage');
}
