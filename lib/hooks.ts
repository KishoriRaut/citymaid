"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getCurrentUser } from "./session";

/**
 * Hook to check authentication and redirect if not logged in
 * Returns the current user or null if redirecting
 */
export function useAuth(redirectTo: string = "/login") {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  return getCurrentUser();
}

/**
 * Hook to redirect logged-in users away from auth pages
 */
export function useAuthRedirect(redirectTo: string = "/dashboard") {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);
}
