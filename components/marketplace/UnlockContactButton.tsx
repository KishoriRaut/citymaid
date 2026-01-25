"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import { useRouter } from "next/navigation";
import { createUnlockRequest } from "@/lib/unlock-requests";
import { isAuthenticated, getCurrentUser } from "@/lib/magic-link-auth";
import { storeUnlockIntent } from "@/lib/unlock-intent";

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
  const router = useRouter();

  const handleUnlockContact = async () => {
    setIsLoading(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Store unlock intent before redirecting to auth
        storeUnlockIntent(postId);
        
        // Redirect to login with postId in redirect URL
        router.push(`/login?redirect=/unlock-payment`);
        return;
      }

      // User is authenticated, create unlock request directly
      const currentUser = getCurrentUser();
      const userId = currentUser?.id;

      const { success, requestId, error } = await createUnlockRequest(
        postId,
        userId
      );

      if (!success) {
        alert(error || 'Failed to create unlock request');
        return;
      }

      // Navigate to the payment page
      router.push(`/unlock-payment/${requestId}`);
      
    } catch (error) {
      console.error("Error handling unlock contact:", error);
      alert('Failed to process unlock request');
    } finally {
      setIsLoading(false);
    }
  };

  // If contact is already viewable, don't show the button
  if (canViewContact) {
    return null;
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
