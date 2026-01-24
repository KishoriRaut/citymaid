/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseClient } from "./supabase-client";
import { supabase } from "./supabase";

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

    // 2. Test Admin Connection (Server-side with Service Role Key)
    console.log("🔧 Testing ADMIN connection (service role key)...");
    try {
      const { count: adminTotal, error: adminTotalError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (adminTotalError) {
        results.adminErrors.push(`Admin total count failed: ${adminTotalError.message} (${adminTotalError.code})`);
      } else {
        results.adminTotalPosts = adminTotal || 0;
        results.adminConnection = true;
      }

      const { count: adminApproved, error: adminApprovedError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (adminApprovedError) {
        results.adminErrors.push(`Admin approved count failed: ${adminApprovedError.message} (${adminApprovedError.code})`);
      } else {
        results.adminApprovedPosts = adminApproved || 0;
      }

      // Get sample posts
      const { data: adminSample, error: adminSampleError } = await supabase
        .from("posts")
        .select("id, status, post_type, work, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (adminSampleError) {
        results.adminErrors.push(`Admin sample failed: ${adminSampleError.message}`);
      } else {
        results.adminSamplePosts = adminSample || [];
      }
    } catch (adminErr) {
      results.adminErrors.push(`Admin connection exception: ${adminErr instanceof Error ? adminErr.message : 'Unknown'}`);
    }

    // 3. Analysis and Diagnosis
    console.log("📊 ANALYZING RESULTS...");
    
    if (!results.homepageConnection && !results.adminConnection) {
      results.diagnosis = "❌ CRITICAL: Both homepage and admin cannot connect to Supabase - Check URL and keys";
    } else if (!results.homepageConnection && results.adminConnection) {
      results.diagnosis = "❌ HOMEPAGE ISSUE: Admin can connect but homepage cannot - Anon key or RLS issue";
    } else if (results.homepageConnection && !results.adminConnection) {
      results.diagnosis = "❌ ADMIN ISSUE: Homepage can connect but admin cannot - Service role key issue";
    } else if (results.adminTotalPosts > results.homepageTotalPosts) {
      results.diagnosis = "⚠️ MISMATCH: Admin sees more posts than homepage - RLS policy blocking anon users";
    } else if (results.adminTotalPosts === 0) {
      results.diagnosis = "❌ EMPTY DATABASE: No posts found - Admin panel might be writing to wrong project";
    } else if (results.homepageApprovedPosts === 0 && results.adminApprovedPosts > 0) {
      results.diagnosis = "⚠️ RLS BLOCK: Approved posts exist but homepage can't see them - Check RLS policies";
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
