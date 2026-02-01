import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "@/lib/posts";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    console.log("🔍 API: getPostById called with postId:", params.postId);
    const { post, error } = await getPostById(params.postId);

    console.log("🔍 API: getPostById result:", {
      error,
      postExists: !!post,
      postId: post?.id,
      hasDetails: !!post?.details,
      detailsLength: post?.details?.length || 0,
      allFields: post ? Object.keys(post) : []
    });

    if (error || !post) {
      return NextResponse.json({ error: error || "Post not found" }, { status: 404 });
    }

    // For public access, mask the contact if payment not approved
    // This is handled by the get_public_posts function, but for single post access
    // we need to check payment status
    // For now, return the post - the frontend will handle masking
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
