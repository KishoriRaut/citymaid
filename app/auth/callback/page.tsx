"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { getStoredRedirect, clearStoredRedirect } from "@/lib/redirect-utils";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Get the current session after Supabase processes the magic link
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Authentication failed. Please try again.");
          return;
        }

        if (!session?.user) {
          // If no session, wait a bit and try again (magic link processing might take time)
          setTimeout(async () => {
            const { data: { session: retrySession }, error: retryError } = await supabaseClient.auth.getSession();
            
            if (retryError || !retrySession?.user) {
              setError("Authentication failed. The link may have expired. Please request a new login link.");
              return;
            }
            
            // Successful authentication
            await handleSuccessfulAuth();
          }, 2000);
          return;
        }

        // Successful authentication
        await handleSuccessfulAuth();
        
      } catch (error) {
        console.error("Auth callback error:", error);
        setError("An error occurred during authentication. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const handleSuccessfulAuth = async () => {
      // Get redirect URL from query params
      const urlRedirect = searchParams?.get('redirect');
      let finalRedirect = "/admin"; // Default redirect

      if (urlRedirect) {
        finalRedirect = decodeURIComponent(urlRedirect);
      } else {
        // Check for stored redirect (post unlock flow)
        const storedRedirect = getStoredRedirect();
        if (storedRedirect) {
          finalRedirect = `/unlock/${storedRedirect.postId}`;
          clearStoredRedirect(); // Clear stored redirect after use
        }
      }

      // Redirect to the appropriate page
      setTimeout(() => {
        router.push(finalRedirect);
      }, 1000);
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication...</h2>
          <p className="text-gray-600">Please wait while we verify your login link.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Request New Login Link
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting you to your destination...</p>
      </div>
    </div>
  );
}
