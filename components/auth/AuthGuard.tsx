"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { storeRedirectForPost, getLoginUrl } from "@/lib/redirect-utils";

interface AuthGuardProps {
  children: ReactNode;
  postId?: string;
  redirectTo?: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export default function AuthGuard({ 
  children, 
  postId, 
  redirectTo, 
  requireAuth = true,
  adminOnly = false 
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      // If authentication is required and user is not authenticated
      if (requireAuth && !isAuthenticated) {
        // Store post ID if provided for redirect after login
        if (postId) {
          storeRedirectForPost(postId);
        }
        
        // Redirect to login page
        const loginUrl = getLoginUrl(redirectTo || (postId ? `/unlock/${postId}` : '/'));
        router.push(loginUrl);
        return;
      }

      // If admin access is required and user is not admin
      if (adminOnly && !isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, postId, redirectTo, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, show loading (will redirect)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If admin access is required but user is not admin, show loading (will redirect)
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}
