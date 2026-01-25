"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { consumeUnlockIntent } from "@/lib/unlock-intent";
import { createUnlockRequest } from "@/lib/unlock-requests";
import { getCurrentUser } from "@/lib/magic-link-auth";

export default function UnlockPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUnlockFlow = async () => {
      try {
        // Check if user is authenticated
        if (!getCurrentUser()) {
          setError("Please log in to continue.");
          setLoading(false);
          return;
        }

        // Try to consume unlock intent
        const unlockIntent = consumeUnlockIntent();
        
        if (!unlockIntent) {
          setError("No unlock request found. Please try again.");
          setLoading(false);
          return;
        }

        console.log("🔓 Processing unlock intent for post:", unlockIntent.postId);
        
        // Create unlock request with authenticated user
        const currentUser = getCurrentUser();
        const userId = currentUser?.id;
        
        const { success, requestId, error: unlockError } = await createUnlockRequest(
          unlockIntent.postId,
          userId
        );
        
        if (!success) {
          console.error("Failed to create unlock request:", unlockError);
          setError(unlockError || 'Failed to process unlock request');
          setLoading(false);
          return;
        }
        
        console.log("🔄 Redirecting to payment page with requestId:", requestId);
        
        // Redirect to payment page
        router.push(`/unlock-payment/${requestId}`);
        
      } catch (err) {
        console.error("Error in unlock flow:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    };

    handleUnlockFlow();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Setting up your payment...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full"
            >
              Go to Homepage
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Will redirect
}
