"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-client";
import { getStoredRedirect, clearStoredRedirect, getPaymentUrl } from "@/lib/redirect-utils";

interface EmailLoginProps {
  redirectTo?: string;
  onSuccess?: (user: any) => void;
}

export default function EmailLogin({ redirectTo, onSuccess }: EmailLoginProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params or stored redirect
  const getRedirectUrl = () => {
    // First check URL parameter
    const urlRedirect = searchParams?.get('redirect');
    if (urlRedirect) {
      return decodeURIComponent(urlRedirect);
    }
    
    // Then check stored redirect (for post unlock flow)
    const storedRedirect = getStoredRedirect();
    if (storedRedirect) {
      return getPaymentUrl(storedRedirect.postId);
    }
    
    // Finally use the prop or default
    return redirectTo || "/admin";
  };

  const handleSendLoginLink = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(getRedirectUrl())}`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Login link sent! Please check your email and click the link to continue.");
        
        // Store email for potential resend functionality
        if (typeof window !== "undefined") {
          localStorage.setItem("citymaid_login_email", email);
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setSuccess("");
    await handleSendLoginLink();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CityMaid</h1>
          <p className="text-gray-600">Login to unlock contact information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-green-800 mb-4">{success}</p>
              <p className="text-xs text-gray-600 mb-4">
                Check your inbox (and spam folder) for the login link from CityMaid.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleResendLink} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Sending..." : "Resend Login Link"}
              </Button>
              
              <Button 
                onClick={() => {
                  setEmail("");
                  setSuccess("");
                  setError("");
                }}
                variant="ghost"
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleSendLoginLink()}
              />
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">🔐 Secure Login Process:</p>
              <ul className="space-y-1">
                <li>• We'll email you a secure login link</li>
                <li>• No password required</li>
                <li>• Link expires in 24 hours</li>
                <li>• Click the link to access your account</li>
              </ul>
            </div>

            <Button 
              onClick={handleSendLoginLink} 
              disabled={loading || !email}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Login Link...
                </>
              ) : (
                "Send Login Link"
              )}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
