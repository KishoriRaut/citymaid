"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

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
        // Get current session (works for both email and phone auth)
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (session?.user) {
          // Check if user is admin based on email
          const adminEmails = [
            "admin@citymaid.com",
            "kishoriraut@example.com",
          ];
          const userEmail = session.user.email || '';
          const isAdminUser = adminEmails.includes(userEmail) || 
                              userEmail.endsWith("@citymaid.com");

          setAuthState({
            isAuthenticated: true,
            isAdmin: isAdminUser,
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

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user is admin based on email
          const adminEmails = [
            "admin@citymaid.com",
            "kishoriraut@example.com",
          ];
          const userEmail = session.user.email || '';
          const isAdminUser = adminEmails.includes(userEmail) || 
                              userEmail.endsWith("@citymaid.com");

          setAuthState({
            isAuthenticated: true,
            isAdmin: isAdminUser,
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
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return authState;
}
