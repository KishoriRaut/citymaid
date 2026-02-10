import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost } from "@/lib/posts";
import { withAdminAuth } from '@/lib/api/admin';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { post, error } = await getPostById(params.postId);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    return withAdminAuth(async (request: Request) => {
      const { postId } = params;
      
      if (!postId) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
      }

      let body;
      try {
        body = await request.json();
      } catch (error) {
        console.error('❌ Failed to parse request body:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }

      console.log(`📝 Updating post: ${postId}`, { body });

      const { post, error } = await updatePost(postId, body);

      if (error) {
        console.error('❌ Error updating post:', error);
        return NextResponse.json({ error: error || 'Failed to update post' }, { status: 500 });
      }

      console.log(`✅ Successfully updated post: ${postId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Post updated successfully',
        post 
      });
    });
  } catch (error) {
    console.error('❌ Update post error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    return withAdminAuth(async (request: Request) => {
      const { postId } = params;

      if (!postId) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
      }

      console.log(`🗑️ Deleting post: ${postId}`);

      // First, delete any related payments
      const { error: paymentError } = await supabase
        .from('payments')
        .delete()
        .eq('post_id', postId);

      if (paymentError) {
        console.error('Error deleting payments:', paymentError);
        // Continue with post deletion even if payment deletion fails
      }

      // Delete any related contact unlock requests
      const { error: unlockError } = await supabase
        .from('contact_unlock_requests')
        .delete()
        .eq('post_id', postId);

      if (unlockError) {
        console.error('Error deleting unlock requests:', unlockError);
        // Continue with post deletion even if unlock requests deletion fails
      }

      // Delete the post
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (postError) {
        console.error('Error deleting post:', postError);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
      }

      console.log(`✅ Successfully deleted post: ${postId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Post and related data deleted successfully' 
      });
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
