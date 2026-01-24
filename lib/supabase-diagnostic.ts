/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseClient } from "./supabase-client";

// Comprehensive Supabase connection diagnostic
export async function diagnoseSupabaseConnection() {
  console.log("🔍 DIAGNOSING SUPABASE CONNECTION...");
  
  const results = {
    environment: "",
    supabaseUrl: "",
    supabaseKeyLength: 0,
    connectionTest: false,
    tableExists: false,
    totalPosts: 0,
    approvedPosts: 0,
    samplePosts: [] as any[],
    errors: [] as string[],
    diagnosis: ""
  };

  try {
    // 1. Check environment variables
    results.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND";
    results.supabaseKeyLength = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0;
    results.environment = process.env.NODE_ENV || "unknown";
    
    console.log("🔧 Environment Check:");
    console.log(`  URL: ${results.supabaseUrl}`);
    console.log(`  Key Length: ${results.supabaseKeyLength}`);
    console.log(`  Environment: ${results.environment}`);

    // 2. Test basic connection
    console.log("🔌 Testing Supabase connection...");
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: connectionTest, error: connectionError } = await supabaseClient
        .from("posts")
        .select("id")
        .limit(1);

      if (connectionError) {
        results.errors.push(`Connection failed: ${connectionError.message} (Code: ${connectionError.code})`);
        results.diagnosis = "❌ Cannot connect to Supabase or posts table";
        console.error("❌ Connection failed:", connectionError);
        return results;
      }
      results.connectionTest = true;
      console.log("✅ Connection successful");
    } catch (connErr) {
      results.errors.push(`Connection exception: ${connErr instanceof Error ? connErr.message : 'Unknown'}`);
      results.diagnosis = "❌ Supabase client not working";
      return results;
    }

    // 3. Check table and get counts
    console.log("📊 Checking posts table...");
    try {
      // Get total posts
      const { count: totalCount, error: totalError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (totalError) {
        results.errors.push(`Total count failed: ${totalError.message}`);
        results.diagnosis = "❌ Cannot access posts table";
        return results;
      }
      
      results.totalPosts = totalCount || 0;
      console.log(`📈 Total posts: ${results.totalPosts}`);

      // Get approved posts
      const { count: approvedCount, error: approvedError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (approvedError) {
        results.errors.push(`Approved count failed: ${approvedError.message}`);
      } else {
        results.approvedPosts = approvedCount || 0;
        console.log(`✅ Approved posts: ${results.approvedPosts}`);
      }

      results.tableExists = true;
    } catch (countErr) {
      results.errors.push(`Count exception: ${countErr instanceof Error ? countErr.message : 'Unknown'}`);
      return results;
    }

    // 4. Get sample posts for verification
    console.log("📋 Getting sample posts...");
    try {
      const { data: sampleData, error: sampleError } = await supabaseClient
        .from("posts")
        .select("id, status, post_type, work, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (sampleError) {
        results.errors.push(`Sample query failed: ${sampleError.message}`);
      } else {
        results.samplePosts = sampleData || [];
        console.log("📋 Sample posts:", results.samplePosts);
      }
    } catch (sampleErr) {
      results.errors.push(`Sample exception: ${sampleErr instanceof Error ? sampleErr.message : 'Unknown'}`);
    }

    // 5. Final diagnosis
    if (results.totalPosts === 0) {
      results.diagnosis = "❌ No posts found in database - Admin panel might be writing to different project";
    } else if (results.approvedPosts === 0) {
      results.diagnosis = "⚠️ Posts exist but none are approved - Check admin approval system";
    } else {
      results.diagnosis = `✅ SUCCESS: ${results.approvedPosts} approved posts found - Homepage should work`;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Diagnostic failed: ${errorMessage}`);
    results.diagnosis = "❌ Diagnostic crashed";
    console.error("❌ Diagnostic crashed:", error);
  }

  console.log("🎯 Diagnostic results:", results);
  return results;
}

// Test with service role key (admin access)
export async function diagnoseServiceRoleConnection() {
  console.log("🔑 TESTING SERVICE ROLE CONNECTION...");
  
  try {
    // Import service role client
    const { createClient } = await import("@supabase/supabase-js");
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = {
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      connectionTest: false,
      totalPosts: 0,
      errors: [] as string[]
    };

    // Test connection with service role
    const { count, error } = await serviceRoleClient
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (error) {
      results.errors.push(`Service role failed: ${error.message}`);
    } else {
      results.connectionTest = true;
      results.totalPosts = count || 0;
    }

    return results;
  } catch (error) {
    return {
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      connectionTest: false,
      totalPosts: 0,
      errors: [`Service role test failed: ${error instanceof Error ? error.message : 'Unknown'}`]
    };
  }
}
