/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseClient } from "./supabase-client";

// Comprehensive diagnostic to compare admin vs homepage connections
export async function compareAdminVsHomepage() {
  console.log("🔍 COMPARING ADMIN vs HOMEPAGE Supabase connections...");
  
  const results = {
    environment: process.env.NODE_ENV || "unknown",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND",
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    
    // Homepage (client-side) tests
    homepageConnection: false,
    homepageTotalPosts: 0,
    homepageApprovedPosts: 0,
    homepageErrors: [] as string[],
    
    // Admin (server-side) tests  
    adminConnection: false,
    adminTotalPosts: 0,
    adminApprovedPosts: 0,
    adminErrors: [] as string[],
    
    // Sample data comparison
    homepageSamplePosts: [] as any[],
    adminSamplePosts: [] as any[],
    
    diagnosis: ""
  };

  try {
    // 1. Test Homepage Connection (Client-side with Anon Key)
    console.log("🌐 Testing HOMEPAGE connection (anon key)...");
    try {
      if (!supabaseClient) {
        results.homepageErrors.push("Supabase client not initialized - missing environment variables");
        return results;
      }
      
      const { count: homeTotal, error: homeTotalError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (homeTotalError) {
        results.homepageErrors.push(`Homepage total count failed: ${homeTotalError.message} (${homeTotalError.code})`);
      } else {
        results.homepageTotalPosts = homeTotal || 0;
        results.homepageConnection = true;
      }

      const { count: homeApproved, error: homeApprovedError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (homeApprovedError) {
        results.homepageErrors.push(`Homepage approved count failed: ${homeApprovedError.message} (${homeApprovedError.code})`);
      } else {
        results.homepageApprovedPosts = homeApproved || 0;
      }

      // Get sample posts
      const { data: homeSample, error: homeSampleError } = await supabaseClient
        .from("posts")
        .select("id, status, post_type, work, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (homeSampleError) {
        results.homepageErrors.push(`Homepage sample failed: ${homeSampleError.message}`);
      } else {
        results.homepageSamplePosts = homeSample || [];
      }
    } catch (homeErr) {
      results.homepageErrors.push(`Homepage connection exception: ${homeErr instanceof Error ? homeErr.message : 'Unknown'}`);
    }

    // 2. Admin tests skipped - server-side only
    console.log("🔧 Admin tests skipped - server-side only");
    results.adminErrors.push("Admin tests require server-side execution");
    results.adminConnection = false;
    results.adminTotalPosts = 0;
    results.adminApprovedPosts = 0;
    results.adminSamplePosts = [];

    // 3. Analysis and Diagnosis
    console.log("📊 ANALYZING RESULTS...");
    
    if (!results.homepageConnection) {
      results.diagnosis = "❌ HOMEPAGE ISSUE: Cannot connect to Supabase - Check environment variables";
    } else if (results.homepageTotalPosts === 0) {
      results.diagnosis = "❌ EMPTY DATABASE: No posts found - Admin panel might be writing to wrong project";
    } else if (results.homepageApprovedPosts === 0 && results.homepageTotalPosts > 0) {
      results.diagnosis = "⚠️ RLS BLOCK: Posts exist but none are approved - Check admin approval system";
    } else if (results.homepageApprovedPosts > 0) {
      results.diagnosis = `✅ SUCCESS: Homepage can see ${results.homepageApprovedPosts} approved posts - Should be working`;
    } else {
      results.diagnosis = "⚠️ UNKNOWN: Check detailed results below";
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.diagnosis = `❌ Diagnostic failed: ${errorMessage}`;
  }

  console.log("🎯 COMPARISON RESULTS:", results);
  return results;
}
