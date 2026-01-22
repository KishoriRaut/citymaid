"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export default function TestPostsPage() {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const test = async () => {
      try {
        // Test 1: Check if Supabase client is configured
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
          setStatus("❌ Environment variables missing");
          setDetails({
            url: url ? "✅ Set" : "❌ Missing",
            key: key ? "✅ Set" : "❌ Missing",
          });
          return;
        }

        setStatus("✅ Environment variables OK");

        // Test 2: Try RPC call
        setStatus("Testing RPC function...");
        const { data: rpcData, error: rpcError } = await supabaseClient.rpc("get_public_posts");

        if (rpcError) {
          setStatus(`❌ RPC Error: ${rpcError.message}`);
          setDetails({
            error: rpcError,
            code: rpcError.code,
            message: rpcError.message,
          });

          // Test 3: Try direct query
          setStatus("Trying direct query...");
          const { data: directData, error: directError } = await supabaseClient
            .from("posts")
            .select("*")
            .eq("status", "approved")
            .limit(5);

          if (directError) {
            setStatus(`❌ Direct query also failed: ${directError.message}`);
            setDetails((prev: any) => ({
              ...prev,
              directError: directError,
            }));
          } else {
            setStatus(`✅ Direct query works! Found ${directData?.length || 0} posts`);
            setDetails((prev: any) => ({
              ...prev,
              directData: directData,
            }));
          }
        } else {
          setStatus(`✅ RPC works! Found ${rpcData?.length || 0} posts`);
          setDetails({
            rpcData: rpcData,
            count: rpcData?.length || 0,
          });
        }
      } catch (err: any) {
        setStatus(`❌ Exception: ${err.message}`);
        setDetails({ exception: err });
      }
    };

    test();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Posts Connection Test</h1>
      <div className="mb-4">
        <p className="text-lg">{status}</p>
      </div>
      {details && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
