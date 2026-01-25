/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabaseClient } from "./supabase-client";

// Comprehensive debugging function to understand why posts aren't appearing
export async function debugPostsTable() {
  console.log("🔍 Starting comprehensive posts table debugging...");
  
  const results = {
    tableExists: false,
    totalRows: 0,
    sampleRows: [],
    statusDistribution: {} as Record<string, number>,
    postTypeDistribution: {} as Record<string, number>,
    hasRLS: false,
    canSelect: false,
    errors: [] as string[],
    recommendations: [] as string[]
  };

  try {
    // 1. Check if table exists and get row count
    console.log("📊 Checking if posts table exists and counting rows...");
    
    if (!supabaseClient) {
      return {
        success: false,
        error: "Supabase client not initialized - missing environment variables",
        details: {
          environment: process.env.NODE_ENV || "unknown",
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND",
          supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        }
      };
    }
    
    const { count, error: countError } = await supabaseClient
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      results.errors.push(`Table count error: ${countError.message}`);
      console.error("❌ Table count error:", countError);
      
      // Check if table exists at all
      if (countError.code === "PGRST116" || countError.message?.includes("does not exist")) {
        results.errors.push("Posts table does not exist!");
        results.recommendations.push("Create the posts table in your Supabase database");
        return results;
      }
    } else {
      results.tableExists = true;
      results.totalRows = count || 0;
      results.canSelect = true;
      console.log(`✅ Posts table exists with ${count} rows`);
    }

    // 2. If table has rows, get sample data to understand structure
    if (results.totalRows > 0) {
      console.log("📋 Getting sample rows to understand data structure...");
      const { data: sampleData, error: sampleError } = await supabaseClient
        .from("posts")
        .select("*")
        .limit(5);

      if (sampleError) {
        results.errors.push(`Sample data error: ${sampleError.message}`);
        console.error("❌ Sample data error:", sampleError);
      } else {
        results.sampleRows = sampleData || [];
        console.log("✅ Sample data retrieved:", sampleData);
      }

      // 3. Analyze status distribution
      console.log("📈 Analyzing status distribution...");
      const { data: statusData, error: statusError } = await supabaseClient
        .from("posts")
        .select("status");

      if (statusError) {
        results.errors.push(`Status analysis error: ${statusError.message}`);
        console.error("❌ Status analysis error:", statusError);
      } else if (statusData) {
        results.statusDistribution = statusData.reduce((acc: Record<string, number>, post: { status: string }) => {
          acc[post.status] = (acc[post.status] || 0) + 1;
          return acc;
        }, {});
        console.log("✅ Status distribution:", results.statusDistribution);
      }

      // 4. Analyze post_type distribution
      console.log("📈 Analyzing post_type distribution...");
      const { data: typeData, error: typeError } = await supabaseClient
        .from("posts")
        .select("post_type");

      if (typeError) {
        results.errors.push(`Post type analysis error: ${typeError.message}`);
        console.error("❌ Post type analysis error:", typeError);
      } else if (typeData) {
        results.postTypeDistribution = typeData.reduce((acc: Record<string, number>, post: { post_type: string }) => {
          acc[post.post_type] = (acc[post.post_type] || 0) + 1;
          return acc;
        }, {});
        console.log("✅ Post type distribution:", results.postTypeDistribution);
      }

      // 5. Test specific queries that your app uses
      console.log("🔍 Testing approved posts query...");
      const { data: approvedData, error: approvedError } = await supabaseClient
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .limit(10);

      if (approvedError) {
        results.errors.push(`Approved posts query error: ${approvedError.message}`);
        console.error("❌ Approved posts query error:", approvedError);
      } else {
        console.log(`✅ Approved posts query returned ${approvedData?.length || 0} rows`);
      }

      // 6. Test with different status values (case sensitivity check)
      console.log("🔍 Testing different status value formats...");
      const statusVariations = ["approved", "Approved", "APPROVED", "pending", "Pending", "PENDING"];
      
      for (const status of statusVariations) {
        const { data: testData, error: testError } = await supabaseClient
          .from("posts")
          .select("status")
          .eq("status", status)
          .limit(1);

        if (!testError && testData && testData.length > 0) {
          console.log(`✅ Found posts with status: "${status}"`);
          if (status !== "approved") {
            results.recommendations.push(`Status values appear to be case-sensitive. Found posts with status "${status}" but not "approved"`);
          }
        }
      }
    } else {
      results.recommendations.push("Posts table exists but is empty. Add some test data to the table.");
    }

    // 7. Check RLS policies
    console.log("🔐 Checking RLS policies...");
    try {
      // This will fail if RLS is blocking access
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: rlsTest, error: rlsError } = await supabaseClient
        .from("posts")
        .select("id")
        .limit(1);

      if (rlsError && rlsError.code === "42501") {
        results.hasRLS = true;
        results.canSelect = false;
        results.errors.push("RLS policies are blocking access to posts table");
        results.recommendations.push("Check RLS policies on posts table - ensure public access for anon users");
      }
    } catch {
      console.log("RLS check completed");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Unexpected error: ${errorMessage}`);
    console.error("❌ Unexpected error during debugging:", error);
  }

  // Generate recommendations based on findings
  if (results.totalRows === 0 && results.tableExists) {
    results.recommendations.push("Table exists but is empty. Add test data using SQL or Supabase dashboard.");
  }

  if (Object.keys(results.statusDistribution).length > 0 && !results.statusDistribution.hasOwnProperty('approved')) {
    const availableStatuses = Object.keys(results.statusDistribution).join(', ');
    results.recommendations.push(`No posts with status 'approved' found. Available statuses: ${availableStatuses}`);
  }

  if (results.errors.length === 0 && results.totalRows > 0) {
    results.recommendations.push("Table and queries appear to be working correctly. Check your frontend code.");
  }

  console.log("🎯 Debugging complete! Results:", results);
  return results;
}

// Helper function to insert test data if needed
export async function insertTestData() {
  console.log("📝 Inserting test data...");
  
  const testPosts = [
    {
      post_type: "employer",
      work: "Software Development",
      time: "Full-time",
      place: "Kathmandu",
      salary: "NPR 50,000 - 80,000",
      contact: "test1@example.com",
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
      contact: "test2@example.com",
      photo_url: null,
      status: "approved",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    },
    {
      post_type: "employer",
      work: "Marketing",
      time: "Contract",
      place: "Lalitpur",
      salary: "NPR 40,000 - 60,000",
      contact: "test3@example.com",
      photo_url: null,
      status: "pending",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    }
  ];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      console.error("❌ Failed to insert test data:", error);
      return { success: false, error: error.message };
    } else {
      console.log("✅ Test data inserted successfully:", data);
      return { success: true, data };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Unexpected error inserting test data:", error);
    return { success: false, error: errorMessage };
  }
}
