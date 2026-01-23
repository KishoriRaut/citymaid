"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  storeRedirectForPost, 
  getPaymentUrl, 
  getLoginUrl
} from "@/lib/redirect-utils";

interface UnlockContactButtonProps {
  postId: string;
  canViewContact: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function UnlockContactButton({ 
  postId, 
  canViewContact, 
  className = "",
  children 
}: UnlockContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const handleUnlockContact = async () => {
    setIsLoading(true);

    try {
      // If user is not authenticated, redirect to login with post ID stored
      if (!isAuthenticated) {
        // Store the post ID for redirect after login
        storeRedirectForPost(postId);
        
        // Redirect to login page
        const loginUrl = getLoginUrl(getPaymentUrl(postId));
        router.push(loginUrl);
        return;
      }

      // If authenticated, go directly to payment form
      // Admins can also access payment form (they might want to test the flow)
      router.push(getPaymentUrl(postId));
      
    } catch (error) {
      console.error("Error handling unlock contact:", error);
      setIsLoading(false);
    }
  };

  // If contact is already viewable, don't show the button
  if (canViewContact) {
    return null;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <Button
        disabled={true}
        className={`w-full ${className}`}
        size="lg"
      >
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking...
        </span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUnlockContact}
      disabled={isLoading}
      className={`w-full ${className}`}
      size="lg"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children || "Unlock Contact"
      )}
    </Button>
  );
}
