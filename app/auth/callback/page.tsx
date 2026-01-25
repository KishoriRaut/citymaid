"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

function AuthCallbackContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Wait a moment for Supabase to process the magic link
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current session (use getSession instead of getUser for anonymous users)
        const { data: { session }, error: sessionError } = await supabaseClient!.auth.getSession();
        
        if (sessionError) {
          // Silently handle AuthSessionMissingError - this can happen if magic link expires
          if (sessionError.name === "AuthSessionMissingError") {
            setError("Authentication failed. The link may have expired. Please request a new login link.");
          } else {
            console.error("Session error:", sessionError);
            setError("Authentication failed. Please try again.");
          }
        } else if (session) {
          // Successfully authenticated
          console.log("✅ Authentication successful for user:", session.user.email);
          
          // Redirect based on user role or to homepage
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1000);
        } else {
          // No session found
          setError("No authentication session found. Please try logging in again.");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An unexpected error occurred during authentication.");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication...</h2>
          <p className="text-gray-600">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting you to the homepage...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured || !supabaseClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Not Available</h2>
          <p className="text-gray-600">Supabase configuration is missing. Please contact administrator.</p>
        </div>
      </div>
    );
  }

  return <AuthCallbackContent />;
}
