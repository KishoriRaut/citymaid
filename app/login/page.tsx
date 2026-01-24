"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentSessionClient } from "@/lib/email-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getCurrentSessionClient();
        
        if (session?.user) {
          // User is already logged in, redirect to intended destination
          const redirectTo = searchParams.get('redirect');
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setLoading(false);
        
        // Since OTP is disabled, show a message about login being temporarily disabled
        setMessage("Login is temporarily disabled. Please contact support for access.");
        
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
        setMessage("Login temporarily disabled. Please try again later.");
      }
    };

    checkAuth();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Checking authentication...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CityMaid Login</h1>
          <p className="text-gray-600">Authentication temporarily disabled</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">{message}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              For access to unlock contact features, please contact our support team.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Listings
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>We're working on improving our authentication system.</p>
          <p className="mt-1">Thank you for your patience.</p>
        </div>
      </div>
    </div>
  );
}
