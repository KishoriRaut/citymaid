import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Fetch contact unlock requests with user contact information
    const { data: unlockRequests, error } = await supabase
      .from('contact_unlock_requests')
      .select(`
        *,
        posts (
          work,
          place,
          salary,
          post_type
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact unlock requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact unlock requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unlockRequests: unlockRequests || []
    });

  } catch (error) {
    console.error('Error in contact unlock requests API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
