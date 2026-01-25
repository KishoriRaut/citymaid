import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const results = {
      serviceRolePosts: 0,
      anonRolePosts: 0,
      rlsIssue: false,
      errors: [] as string[]
    };

    // Check with service role (should see all posts)
    try {
      const { count: serviceCount, error: serviceError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (serviceError) {
        results.errors.push(`Service role error: ${serviceError.message}`);
      } else {
        results.serviceRolePosts = serviceCount || 0;
      }
    } catch (err) {
      results.errors.push(`Service role exception: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // Check with anon role (what client sees)
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { count: anonCount, error: anonError } = await anonClient
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (anonError) {
        results.errors.push(`Anon role error: ${anonError.message}`);
      } else {
        results.anonRolePosts = anonCount || 0;
      }
    } catch (err) {
      results.errors.push(`Anon role exception: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    // Determine if RLS is blocking access
    results.rlsIssue = results.serviceRolePosts > 0 && results.anonRolePosts === 0;

    return NextResponse.json({
      success: true,
      data: results,
      diagnosis: results.rlsIssue ? 
        "❌ RLS BLOCK: Service role sees posts but anon role doesn't - Check RLS policies" :
        results.anonRolePosts > 0 ? 
        "✅ OK: Both service and anon roles can see posts" :
        "❌ EMPTY: No posts in database",
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
