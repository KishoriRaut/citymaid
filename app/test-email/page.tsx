"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { testEmailConfig } from "@/lib/check-email-config";

export default function TestEmailPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const testResult = await testEmailConfig();
      setResult(testResult);
    } catch (error) {
      setResult({ 
        success: false, 
        error: "Test failed", 
        details: error 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">🔧 Email Configuration Test</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Email Authentication</h2>
              <p className="text-gray-600 mb-4">
                This will test if your Supabase email provider is properly configured.
                It will attempt to send a magic link to test@example.com (won't actually be delivered).
              </p>
              
              <Button onClick={runTest} disabled={loading} className="w-full">
                {loading ? "Testing..." : "🧪 Run Email Test"}
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
                    ✅ Email configuration is working!
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                    ❌ Email Configuration Issue: {result.error}
                    
                    <div className="mt-3 text-sm">
                      <strong>🔧 To Fix This:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Go to your Supabase Dashboard</li>
                        <li>Navigate to Authentication → Providers</li>
                        <li>Enable the Email provider</li>
                        <li>Configure email settings (SMTP, Resend, or Supabase Email)</li>
                        <li>Save and try again</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Email Provider Options:</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Supabase Email:</strong> Easiest for development, limited daily sends</li>
                <li><strong>Resend:</strong> Recommended for production, reliable delivery</li>
                <li><strong>Custom SMTP:</strong> Use your own email service (Gmail, SendGrid, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
