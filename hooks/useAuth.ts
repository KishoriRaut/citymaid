"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { setupAuthListener, cleanupAuthListener, isAdminUser, getCurrentSession } from "@/lib/auth-utils";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  profile: any;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session } = await getCurrentSession();
        
        if (session?.user) {
          const isAdminUserFlag = isAdminUser(session.user.email);

          setAuthState({
            isAuthenticated: true,
            isAdmin: isAdminUserFlag,
            user: session.user,
            profile: session.user, // For email auth, user profile is in user object
            isLoading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            user: null,
            profile: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          profile: null,
          isLoading: false,
        });
      }
    };

    checkAuth();

    // Listen for auth changes using centralized listener
    const subscription = setupAuthListener(async (event, session) => {
      if (session?.user) {
        const isAdminUserFlag = isAdminUser(session.user.email);

        setAuthState({
          isAuthenticated: true,
          isAdmin: isAdminUserFlag,
          user: session.user,
          profile: session.user,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          profile: null,
          isLoading: false,
        });
      }
    });

    return () => {
      cleanupAuthListener();
    };
  }, []);

  return authState;
}
