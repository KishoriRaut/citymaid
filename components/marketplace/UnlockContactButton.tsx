"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createUnlockRequest } from "@/lib/admin-payments";

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
      // Create unlock request directly without authentication
      const { success, requestId, error } = await createUnlockRequest(
        postId,
        null // No userId for visitor-based system
      );

      if (!success) {
        alert(error || 'Failed to create unlock request');
        return;
      }

      console.log('✅ Unlock request created:', requestId);
      // Navigate to the SAME payment page used by post creation
      // We'll use the postId as the parameter and pass the requestId as a query param
      router.push(`/post-payment/${postId}?unlock_request=${requestId}`);
      
    } catch (error) {
      console.error('❌ Error in unlock contact:', error);
      alert('An error occurred. Please try again.');
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
