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
    console.error("Error parsing user from localStorage:", error);
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
 */
export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("user");
}

/**
 * Set user session
 */
export function setSession(user: User): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));
}
