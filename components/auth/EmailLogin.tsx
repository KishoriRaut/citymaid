"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { clearSupabaseStorage, setupAuthListener, cleanupAuthListener, getCurrentSession } from "@/lib/auth-utils";

interface EmailLoginProps {
  redirectTo?: string;
  onSuccess?: (user: any) => void;
}

export default function EmailLogin({ redirectTo = "/dashboard", onSuccess }: EmailLoginProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  // Clear storage on mount and listen to auth state changes
  useEffect(() => {
    // Clear any existing storage to prevent multiple client issues
    clearSupabaseStorage();

    // Listen to auth state changes using centralized listener
    const subscription = setupAuthListener(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSuccess(`Successfully signed in as ${session.user.email}`);
          setError("");
          onSuccess?.(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSuccess("");
        }
      }
    );

    // Check for existing session using centralized utility
    getCurrentSession().then(({ session }) => {
      if (session?.user) {
        setUser(session.user);
        setSuccess(`Already signed in as ${session.user.email}`);
      }
    });

    return () => {
      cleanupAuthListener();
    };
  }, [onSuccess]);

  const handleSendMagicLink = async () => {
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
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        console.error('OTP Error:', error);
        
        // Provide specific error messages
        if (error.message?.includes('Email provider is not enabled')) {
          setError('Email authentication is not configured. Please enable the email provider in your Supabase dashboard.');
        } else if (error.status === 500) {
          setError('Server error. Please ensure the email provider is enabled in Supabase dashboard.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(`Magic link sent to ${email}! Check your inbox (and spam folder).`);
        console.log('Magic link sent successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      clearSupabaseStorage();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // If user is already signed in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Signed in as {user.email}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = redirectTo}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Enter your email to receive a magic link</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

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
              onKeyPress={(e) => e.key === "Enter" && handleSendMagicLink()}
            />
          </div>

          <button
            onClick={handleSendMagicLink}
            disabled={loading || !email}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Magic Link...
              </span>
            ) : (
              "Send Magic Link"
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>We'll email you a magic link for instant access.</p>
          <p className="mt-1">No password required.</p>
        </div>
      </div>
    </div>
  );
}
