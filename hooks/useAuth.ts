"use client";

import { useState, useEffect } from "react";
import { getCurrentPhoneUserClient } from "@/lib/phone-auth";

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
        const userSession = await getCurrentPhoneUserClient();
        
        if (userSession?.user) {
          // Check if user is admin
          const adminEmails = [
            "admin@citymaid.com",
            "kishoriraut@example.com",
          ];
          const isAdminUser = adminEmails.includes(userSession.user.email) || 
                              userSession.user.email.endsWith("@citymaid.com");

          setAuthState({
            isAuthenticated: true,
            isAdmin: isAdminUser,
            user: userSession.user,
            profile: userSession.profile,
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
  }, []);

  return authState;
}
