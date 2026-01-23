"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-client";

export default function TestSimpleAuth() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSimpleSignup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Try a simple signup with password instead of magic link
      const { data, error } = await supabaseClient.auth.signUp({
        email: 'test@citymaid.com',
        password: 'testpassword123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      setResult({ success: !error, data, error: error?.message });
    } catch (error) {
      setResult({ success: false, error: "Exception occurred", details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">🧪 Simple Auth Test</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Basic Auth Functionality</h2>
              <p className="text-gray-600 mb-4">
                This will test if Supabase auth is working at all, bypassing email issues.
              </p>
              
              <Button onClick={testSimpleSignup} disabled={loading} className="w-full">
                {loading ? "Testing..." : "🧪 Test Simple Signup"}
              </Button>
            </div>
            
            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                
                {result.success ? (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                    ✅ Basic auth is working! The issue is specifically with email delivery.
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                    ❌ Even basic auth failed: {result.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
