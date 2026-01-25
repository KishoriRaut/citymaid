"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendMagicLink } from "@/lib/magic-link-auth";
import { Button } from "@/components/shared/button";

export default function MagicLinkLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      const result = await sendMagicLink(email, redirectTo);
      
      if (result.success) {
        setMessage("✅ Magic link sent! Check your email and click the link to continue.");
        setEmail(""); // Clear email input
      } else {
        setError(result.error || "Failed to send magic link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In Required</h1>
        <p className="text-gray-600">Enter your email to unlock contact information</p>
      </div>

      {/* Info message about unlock flow */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>🔓 Unlock Process:</strong><br />
          1. Enter your email below<br />
          2. Click the magic link we send you<br />
          3. Complete payment (Rs. 50)<br />
          4. Admin approves within 24 hours<br />
          5. Contact information revealed
        </p>
      </div>

      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-xs text-green-800">
          <strong>No password needed.</strong> We'll email you a secure login link that works instantly.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? "Sending Magic Link..." : "Send Magic Link"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Check your spam folder if you don't see the email within 1 minute.
        </p>
      </div>
    </div>
  );
}
