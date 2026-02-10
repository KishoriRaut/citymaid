import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.max(1, Number(url.searchParams.get("limit") || 12));
    const postType = url.searchParams.get("postType") || "all";

    console.log("[PUBLIC_POSTS_API] Request received");
    console.log("[PUBLIC_POSTS_API] Query parameters:", { page, limit, postType });
    console.log("[PUBLIC_POSTS_API] Request URL:", request.url);

    console.log("[PUBLIC_POSTS_API] Starting Supabase RPC call...");
    
    // Fixed: Use correct parameter names matching SQL function
    const { data, error } = await supabase.rpc("get_public_posts", {
      page_param: page,           // ✅ Correct parameter name
      limit_param: limit,          // ✅ Correct parameter name
      post_type_filter: postType.toLowerCase(), // ✅ Correct parameter name
    });

    if (error) {
      console.error("[PUBLIC_POSTS_API] Supabase RPC Error:", error);
      console.error("[PUBLIC_POSTS_API] Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          posts: [],
          pagination: {
            page,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
            totalPosts: 0,
          },
          error: 'Database function error',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log("[PUBLIC_POSTS_API] Supabase RPC success");
    console.log("[PUBLIC_POSTS_API] RPC Data type:", typeof data);
    console.log("[PUBLIC_POSTS_API] RPC Data length:", data?.length);
    console.log("[PUBLIC_POSTS_API] Raw RPC Data:", JSON.stringify(data, null, 2));

    // Validate RPC response
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("[PUBLIC_POSTS_API] No results from RPC - data was:", data);
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          totalPosts: 0,
        },
      });
    }

    // Extract first result (function returns single row)
    const result = data[0];
    if (!result) {
      console.log("[PUBLIC_POSTS_API] No result in first row - data was:", data);
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          totalPosts: 0,
        },
      });
    }

    console.log("[PUBLIC_POSTS_API] Result extracted:", JSON.stringify(result, null, 2));

    // Validate result structure
    const validationErrors = [];
    
    if (!result.posts || !Array.isArray(result.posts)) {
      validationErrors.push('Invalid posts data');
    }
    
    if (typeof result.total_count !== 'number') {
      validationErrors.push('Invalid total_count type');
    }
    
    if (typeof result.current_page !== 'number') {
      validationErrors.push('Invalid current_page type');
    }
    
    if (typeof result.total_pages !== 'number') {
      validationErrors.push('Invalid total_pages type');
    }

    if (validationErrors.length > 0) {
      console.error("[PUBLIC_POSTS_API] Validation errors:", validationErrors);
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          totalPosts: 0,
        },
        error: 'Validation failed: ' + validationErrors.join(', ')
      }, { status: 500 });
    }

    // Ensure pagination integers and complete response structure
    const pagination = {
      page: result.current_page ?? page,
      totalPages: result.total_pages ?? 1,
      hasNext: result.has_next_page ?? false,
      hasPrev: result.has_prev_page ?? false,
      totalPosts: result.total_count ?? 0,  // ✅ Added missing field
    };

    const response = {
      posts: result.posts ?? [],
      pagination,
    };

    console.log("[PUBLIC_POSTS_API] Final response:", JSON.stringify(response, null, 2));
    console.log("[PUBLIC_POSTS_API] Request completed successfully");

    return NextResponse.json(response);

  } catch (err) {
    console.error("[PUBLIC_POSTS_API] Unexpected Error:", err);
    console.error("[PUBLIC_POSTS_API] Error type:", err instanceof Error ? err.constructor.name : 'Unknown');
    console.error("[PUBLIC_POSTS_API] Error message:", err instanceof Error ? err.message : 'Unknown error');
    
    return NextResponse.json(
      {
        posts: [],
        pagination: {
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          totalPosts: 0,
        },
        error: err instanceof Error ? err.message : 'Unexpected error'
      },
      { status: 500 }
    );
  }
}
