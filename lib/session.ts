"use client";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    const user = JSON.parse(userStr) as User;
    return user;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error parsing user from localStorage:", error);
    }
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Clear user session
 * Also clears the cookie
 */
export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("user");
  
  // Clear cookie
  document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Set user session
 * Also sets a cookie for server-side middleware validation
 */
export function setSession(user: User): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));
  
  // Set cookie for server-side middleware validation
  // Cookie expires in 7 days
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `user_session=${JSON.stringify(user)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}
