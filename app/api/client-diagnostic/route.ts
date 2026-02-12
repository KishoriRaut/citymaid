import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const results = {
      environment: process.env.NODE_ENV || "unknown",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND",
      supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      connectionTest: false,
      tableExists: false,
      totalPosts: 0,
      approvedPosts: 0,
      samplePosts: [] as unknown[],
      errors: [] as string[],
      diagnosis: ""
    };

    // Test basic connection with client-side Supabase
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: _connectionTest, error: connectionError } = await supabaseClient
        .from("posts")
        .select("id")
        .limit(1);

      if (connectionError) {
        results.errors.push(`Connection failed: ${connectionError.message} (Code: ${connectionError.code})`);
        results.diagnosis = "❌ Cannot connect to Supabase or posts table";
      } else {
        results.connectionTest = true;
      }
    } catch (connErr) {
      results.errors.push(`Connection exception: ${connErr instanceof Error ? connErr.message : 'Unknown'}`);
      results.diagnosis = "❌ Supabase client not working";
    }

    if (results.connectionTest) {
      // Get total posts
      try {
        const { count: totalCount, error: totalError } = await supabaseClient
          .from("posts")
          .select("*", { count: "exact", head: true });

        if (totalError) {
          results.errors.push(`Total count failed: ${totalError.message}`);
        } else {
          results.totalPosts = totalCount || 0;
          results.tableExists = true;
        }
      } catch (countErr) {
        results.errors.push(`Count exception: ${countErr instanceof Error ? countErr.message : 'Unknown'}`);
      }

      // Get approved posts
      if (results.tableExists) {
        try {
          const { count: approvedCount, error: approvedError } = await supabaseClient
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved");

          if (approvedError) {
            results.errors.push(`Approved count failed: ${approvedError.message}`);
          } else {
            results.approvedPosts = approvedCount || 0;
          }
        } catch (approvedErr) {
          results.errors.push(`Approved count exception: ${approvedErr instanceof Error ? approvedErr.message : 'Unknown'}`);
        }

        // Get sample posts
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
          }
        } catch (sampleErr) {
          results.errors.push(`Sample exception: ${sampleErr instanceof Error ? sampleErr.message : 'Unknown'}`);
        }
      }
    }

    // Final diagnosis
    if (results.totalPosts === 0) {
      results.diagnosis = "❌ EMPTY DATABASE: No posts found - Client cannot see any data";
    } else if (results.approvedPosts === 0) {
      results.diagnosis = "⚠️ RLS BLOCK: Posts exist but client cannot see approved posts - Check RLS policies";
    } else {
      results.diagnosis = `✅ SUCCESS: Client can see ${results.approvedPosts} approved posts`;
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
