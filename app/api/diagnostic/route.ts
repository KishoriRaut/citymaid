import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const results = {
      environment: process.env.NODE_ENV || "unknown",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND",
      supabaseKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      connectionTest: false,
      tableExists: false,
      totalPosts: 0,
      approvedPosts: 0,
      samplePosts: [] as any[],
      errors: [] as string[],
      diagnosis: ""
    };

    // Test basic connection
    try {
      const { data: connectionTest, error: connectionError } = await supabase
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
        const { count: totalCount, error: totalError } = await supabase
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
          const { count: approvedCount, error: approvedError } = await supabase
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
          const { data: sampleData, error: sampleError } = await supabase
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
      results.diagnosis = "❌ EMPTY DATABASE: No posts found - Admin panel might be writing to wrong project";
    } else if (results.approvedPosts === 0) {
      results.diagnosis = "⚠️ Posts exist but none are approved - Check admin approval system";
    } else {
      results.diagnosis = `✅ SUCCESS: ${results.approvedPosts} approved posts found - Homepage should work`;
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
