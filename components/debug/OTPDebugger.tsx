"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { debugOTPSystem } from "@/lib/debug-otp";
import { checkSupabaseConfig } from "@/lib/check-supabase-config";

export default function OTPDebugger() {
  const [phone, setPhone] = useState("+9779841234567");
  const [results, setResults] = useState<any>(null);
  const [configResults, setConfigResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const debugResult = await debugOTPSystem(phone);
      setResults(debugResult);
    } catch (error) {
      setResults({ 
        success: false, 
        error: "Debug failed", 
        stage: "debug_error",
        details: error 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfig = async () => {
    setIsCheckingConfig(true);
    setConfigResults(null);
    
    try {
      const configResult = await checkSupabaseConfig();
      setConfigResults(configResult);
    } catch (error) {
      setConfigResults({ 
        success: false, 
        error: "Config check failed", 
        details: error 
      });
    } finally {
      setIsCheckingConfig(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔍 OTP System Debugger</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Phone Number:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="+9779841234567"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={checkConfig} disabled={isCheckingConfig} variant="outline" className="flex-1">
            {isCheckingConfig ? "Checking..." : "🔧 Check Supabase Config"}
          </Button>
          
          <Button onClick={runDebug} disabled={isLoading} className="flex-1">
            {isLoading ? "Running Debug..." : "🔍 Debug OTP System"}
          </Button>
        </div>
        
        {configResults && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Supabase Configuration:</h3>
            <pre className="text-xs overflow-auto bg-gray-800 text-blue-400 p-3 rounded">
              {JSON.stringify(configResults, null, 2)}
            </pre>
            
            {configResults.success ? (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                ✅ Supabase configuration is correct!
              </div>
            ) : (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                ❌ Configuration Issue: {configResults.error}
                {configResults.details?.solution && (
                  <div className="mt-2 text-sm font-medium">
                    💡 Solution: {configResults.details.solution}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">📤 OTP Test Results:</h3>
            <pre className="text-xs overflow-auto bg-gray-800 text-green-400 p-3 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
            
            {results.success ? (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                ✅ OTP System Working! Check your phone for the OTP.
              </div>
            ) : (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                ❌ Issue Found: {results.error}
                {results.details && (
                  <div className="mt-2 text-sm">
                    Details: {typeof results.details === 'string' ? results.details : JSON.stringify(results.details)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-xs text-gray-600">
        <h4 className="font-semibold mb-2">🔍 Common Issues & Solutions:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>SMS Provider Not Configured:</strong> Go to Supabase Dashboard → Authentication → Providers → Phone → Configure SMS gateway</li>
          <li><strong>Phone Auth Not Enabled:</strong> Enable Phone provider in Supabase Dashboard</li>
          <li><strong>Invalid Phone Format:</strong> Use country code (+977 for Nepal, +1 for US)</li>
          <li><strong>Rate Limiting:</strong> Wait 60 seconds between OTP requests</li>
          <li><strong>Environment Variables:</strong> Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </div>
    </div>
  );
}
