"use client";

import { isSupabaseConfigured } from "@/lib/supabase-client";

export function EnvironmentCheck({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Environment Variables Missing</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">🚨 CRITICAL: Supabase Configuration Missing</h3>
              <p className="text-gray-700 mb-4">Your Vercel deployment is missing required environment variables.</p>
              
              <div className="text-left bg-white rounded p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-3">🔧 IMMEDIATE FIX - Add these to Vercel:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-gray-100 p-2 rounded">
                    <strong>NEXT_PUBLIC_SUPABASE_URL:</strong><br/>
                    https://jjnibbkhubafesjqjohm.supabase.co
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong><br/>
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbmliYmtodWJhZmVzanFqb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNTE5NTUsImV4cCI6MjA4NDYyNzk1NX0.Koz-ntS74jByLLdkDo74lgH3EygPdJiey_fw17t9Ra8
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <strong>SUPABASE_SERVICE_ROLE_KEY:</strong><br/>
                    eyJhbGciOiJHUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbmliYmtodWJhZmVzanFqb2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA1MTk1NSwiZXhwIjoyMDg0NjI3OTU1fQ.Y1LRz4DHdvwVhKHGUv2Ylb3gRgc89VRgnIIUwJN6joA
                  </div>
                </div>
              </div>

              <div className="text-left bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-bold text-blue-900 mb-2">📋 STEP-BY-STEP INSTRUCTIONS:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Go to <strong>Vercel Dashboard</strong> → <strong>Your Project</strong></li>
                  <li>Navigate to <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                  <li>Click <strong>&quot;Add New&quot;</strong> for each variable above</li>
                  <li>Set environment to <strong>Production</strong></li>
                  <li><strong>Redeploy</strong> your application</li>
                </ol>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              After adding environment variables, your site will work properly and show posts from your database.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
