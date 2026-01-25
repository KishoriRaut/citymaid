/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabaseClient } from "./supabase-client";

// Production-specific debugging to identify Vercel vs local database differences
export async function debugProductionDatabase() {
  console.log("🔍 Starting PRODUCTION database debugging...");
  console.log("🌐 Current Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const results = {
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isProduction: process.env.NODE_ENV === "production",
      isVercel: typeof window !== "undefined" && window.location.hostname.includes("vercel.app"),
    },
    database: {
      tableExists: false,
      totalRows: 0,
      statusDistribution: {} as Record<string, number>,
      postTypeDistribution: {} as Record<string, number>,
      sampleRows: [],
      hasRLS: false,
      canSelect: false,
    },
    issues: [] as string[],
    recommendations: [] as string[],
  };

  try {
    // 1. Test basic connection
    console.log("🔌 Testing Supabase connection...");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (!supabaseClient) {
      return {
        success: false,
        error: "Supabase client not initialized - missing environment variables",
        environment: process.env.NODE_ENV || "unknown",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND",
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      };
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: connectionTest, error: connectionError } = await supabaseClient
      .from("posts")
      .select("id")
      .limit(1);

    if (connectionError) {
      results.issues.push(`Connection failed: ${connectionError.message}`);
      if (connectionError.code === "PGRST116") {
        results.issues.push("Posts table does not exist in production database!");
        results.recommendations.push("Run database migrations in production");
      }
      return results;
    }

    results.database.canSelect = true;
    console.log("✅ Supabase connection successful");

    // 2. Count total rows
    console.log("📊 Counting total rows in production...");
    const { count, error: countError } = await supabaseClient
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      results.issues.push(`Count query failed: ${countError.message}`);
    } else {
      results.database.totalRows = count || 0;
      console.log(`📊 Production database has ${count} rows`);
    }

    // 3. If no rows, this is the main issue
    if (results.database.totalRows === 0) {
      results.issues.push("Production database is EMPTY - no posts found");
      results.recommendations.push("Insert test data into production database");
      results.recommendations.push("Check if you're pointing to the correct production database");
      results.recommendations.push("Verify data migration from development to production");
      return results;
    }

    // 4. Analyze status distribution
    console.log("📈 Analyzing status distribution in production...");
    const { data: statusData, error: statusError } = await supabaseClient
      .from("posts")
      .select("status");

    if (statusError) {
      results.issues.push(`Status analysis failed: ${statusError.message}`);
    } else if (statusData) {
      results.database.statusDistribution = statusData.reduce((acc: Record<string, number>, post: { status: string }) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {});
      console.log("📈 Production status distribution:", results.database.statusDistribution);

      // Check if 'approved' status exists
      if (!results.database.statusDistribution.hasOwnProperty('approved')) {
        const availableStatuses = Object.keys(results.database.statusDistribution).join(', ');
        results.issues.push(`No posts with status 'approved' found in production`);
        results.issues.push(`Available statuses in production: ${availableStatuses}`);
        results.recommendations.push("Update post statuses to 'approved' in production");
        results.recommendations.push("Or modify query to match existing status values");
      }
    }

    // 5. Test approved posts query specifically
    console.log("🔍 Testing approved posts query in production...");
    const { data: approvedData, error: approvedError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .limit(10);

    if (approvedError) {
      results.issues.push(`Approved posts query failed: ${approvedError.message}`);
    } else {
      console.log(`✅ Approved posts query returned ${approvedData?.length || 0} rows`);
      if (approvedData && approvedData.length === 0 && results.database.totalRows > 0) {
        results.issues.push("Posts exist but none have 'approved' status");
      }
    }

    // 6. Check RLS policies
    console.log("🔐 Checking RLS policies in production...");
    try {
      const { error: rlsError } = await supabaseClient
        .from("posts")
        .select("id")
        .limit(1);

      if (rlsError && rlsError.code === "42501") {
        results.database.hasRLS = true;
        results.database.canSelect = false;
        results.issues.push("RLS policies are blocking anonymous access in production");
        results.recommendations.push("Check RLS policies on posts table in production");
        results.recommendations.push("Ensure anon role has SELECT access");
      }
    } catch {
      console.log("RLS check completed");
    }

    // 7. Get sample data for inspection
    if (results.database.totalRows > 0) {
      console.log("📋 Getting sample data from production...");
      const { data: sampleData, error: sampleError } = await supabaseClient
        .from("posts")
        .select("*")
        .limit(3);

      if (sampleError) {
        results.issues.push(`Sample data query failed: ${sampleError.message}`);
      } else {
        results.database.sampleRows = sampleData || [];
        console.log("📋 Production sample data:", sampleData);
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.issues.push(`Unexpected error: ${errorMessage}`);
    console.error("❌ Production debugging error:", error);
  }

  // Generate production-specific recommendations
  if (results.database.totalRows === 0) {
    results.recommendations.push("🔥 IMMEDIATE ACTION NEEDED: Production database is empty");
    results.recommendations.push("1. Check if you're connected to the correct Supabase project");
    results.recommendations.push("2. Run database migrations in production");
    results.recommendations.push("3. Import seed data to production database");
  }

  if (results.issues.length === 0 && results.database.totalRows > 0) {
    results.recommendations.push("✅ Production database appears healthy - check frontend code");
  }

  console.log("🎯 Production debugging complete:", results);
  return results;
}

// Quick production data insertion for testing
export async function insertProductionTestData() {
  console.log("📝 Inserting PRODUCTION test data...");
  
  const testPosts = [
    {
      post_type: "employer",
      work: "Software Development",
      time: "Full-time",
      place: "Kathmandu",
      salary: "NPR 50,000 - 80,000",
      contact: "production-test1@example.com",
      photo_url: null,
      status: "approved",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    },
    {
      post_type: "employee",
      work: "Web Design",
      time: "Part-time",
      place: "Pokhara",
      salary: "NPR 30,000 - 50,000",
      contact: "production-test2@example.com",
      photo_url: null,
      status: "approved",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    }
  ];

  try {
    if (!supabaseClient) {
      return {
        success: false,
        error: "Supabase client not initialized - missing environment variables"
      };
    }
    
    const { data, error } = await supabaseClient
      .from("posts")
      .insert(testPosts as any)
      .select();

    if (error) {
      console.error("❌ Failed to insert production test data:", error);
      return { success: false, error: error.message };
    } else {
      console.log("✅ Production test data inserted successfully:", data);
      return { success: true, data };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error inserting production test data:", error);
    return { success: false, error: errorMessage };
  }
}
