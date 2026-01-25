"use client";

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const userStr = localStorage.getItem("user");
    return !!userStr && !!JSON.parse(userStr);
  } catch {
    return false;
  }
}

// Get current user
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}
