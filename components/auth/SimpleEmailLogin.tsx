"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export default function SimpleEmailLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Clear browser storage on mount to avoid multiple instances
  useEffect(() => {
    // Clear Supabase storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('✅ Cleared Supabase browser storage');
  }, []);

  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { data, error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback",
        },
      });

      if (error) {
        console.error("OTP Error:", error);
        setMessage("Error sending OTP. Check Supabase email provider.");
        setIsError(true);
      } else {
        console.log("OTP sent successfully");
        setMessage(`Check your email for the login link: ${email}`);
        setIsError(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Error sending OTP. Check Supabase email provider.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CityMaid Login</h1>
          <p className="text-gray-600">Enter your email to receive a magic link</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            isError 
              ? "bg-red-50 border border-red-200" 
              : "bg-green-50 border border-green-200"
          }`}>
            <p className={`text-sm ${isError ? "text-red-600" : "text-green-800"}`}>
              {message}
            </p>
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
              onKeyPress={(e) => e.key === "Enter" && handleSendOTP()}
            />
          </div>

          <button
            onClick={handleSendOTP}
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
