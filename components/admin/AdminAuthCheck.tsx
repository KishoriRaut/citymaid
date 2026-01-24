"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isAdminUser } from "@/lib/auth/isAdmin";

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
    const checkAuth = () => {
      try {
        const user = getCurrentUser();
        
        if (!user) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          router.push(redirectTo);
          return;
        }

        setIsAuthenticated(true);
        
        // Check if user is admin using role
        const isAdminUserCheck = isAdminUser(user);
        setIsAdmin(isAdminUserCheck);
        
        if (!isAdminUserCheck) {
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
