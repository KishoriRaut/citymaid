"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HomepageFeatureButtonProps {
  postId: string;
  homepagePaymentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  className?: string;
  children?: React.ReactNode;
}

export default function HomepageFeatureButton({ 
  postId, 
  homepagePaymentStatus,
  className = "",
  children 
}: HomepageFeatureButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestHomepageFeature = async () => {
    setIsLoading(true);

    try {
      // Navigate to post payment page
      router.push(`/post-payment/${postId}`);
      
    } catch (error) {
      console.error("Error handling homepage feature request:", error);
      alert('Failed to process homepage feature request');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if already approved or pending
  if (homepagePaymentStatus === 'approved' || homepagePaymentStatus === 'pending') {
    return null;
  }

  return (
    <Button
      onClick={handleRequestHomepageFeature}
      disabled={isLoading}
      className={`w-full ${className}`}
      size="sm"
      variant="outline"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children || "🏠 Feature on Homepage - NPR 500"
      )}
    </Button>
  );
}
