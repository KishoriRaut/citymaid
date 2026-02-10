import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api/admin';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
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
