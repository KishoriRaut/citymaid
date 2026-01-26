"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main login page after 3 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirecting to login...</h2>
        <p className="text-sm text-gray-600 mb-4">You'll be redirected to the main login page.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Quick Admin Access:</strong>
          </p>
          <p className="text-xs text-blue-700 mb-1">
            Email: kishoriraut369@gmail.com
          </p>
          <p className="text-xs text-blue-700 mb-2">
            Password: admin123k
          </p>
          <Link 
            href="/admin/temp-login"
            className="inline-block text-xs text-blue-600 underline hover:text-blue-800"
          >
            Use Temporary Admin Login &rarr;
          </Link>
        </div>
        
        <Link 
          href="/admin/temp-login"
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Go to Temporary Admin Login
        </Link>
      </div>
    </div>
  );
}
