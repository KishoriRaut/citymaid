"use client";

import { useEffect, useState } from "react";
import { getCurrentPhoneUserClient } from "@/lib/phone-auth";
import { useRouter } from "next/navigation";

interface AdminAuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AdminAuthCheck({ children, redirectTo = "/login" }: AdminAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userSession = await getCurrentPhoneUserClient();
        
        if (!userSession || !userSession.user) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          router.push(redirectTo);
          return;
        }

        setIsAuthenticated(true);
        
        // Check if user is admin by checking if they have admin privileges
        // This is a simplified check - in production, you'd have a proper role system
        const isAdminUser = await checkIfAdmin(userSession.user.email);
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Simple admin check - replace with your actual admin logic
  const checkIfAdmin = async (email?: string): Promise<boolean> => {
    if (!email) return false;
    
    // For now, check if email is in a predefined list or has admin domain
    // In production, you'd check against a users table or role system
    const adminEmails = [
      "admin@citymaid.com",
      "kishoriraut@example.com", // Add your admin emails here
    ];
    
    return adminEmails.includes(email) || email.endsWith("@citymaid.com");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
