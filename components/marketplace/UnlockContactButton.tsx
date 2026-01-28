"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createUnlockRequest } from "@/lib/admin-payments";
import { Lock, CreditCard } from "lucide-react";

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
      className={`w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      size="sm"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Unlock Contact - Rs. 50</span>
        </span>
      )}
    </Button>
  );
}
