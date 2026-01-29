import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 UNIFIED API - Fetching payment requests...');
    
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const type = searchParams.get('type');
    const visitorId = searchParams.get('visitor_id');
    
    console.log('🔧 UNIFIED API - Query params:', { postId, type, visitorId });

    const requests: any[] = [];

    // Get contact unlock requests
    if (!type || type === 'contact_unlock') {
      let query = supabase
        .from('contact_unlock_requests')
        .select(`
          *,
          posts(title, work, place, salary, post_type)
        `);

      if (postId) {
        query = query.eq('post_id', postId);
      }
      if (visitorId) {
        query = query.eq('visitor_id', visitorId);
      }

      const { data: unlockRequests, error: unlockError } = await query;

      if (!unlockError && unlockRequests) {
        const formattedRequests = unlockRequests.map(req => ({
          ...req,
          type: 'contact_unlock'
        }));
        requests.push(...formattedRequests);
      }
    }

    // Get post promotion requests
    if (!type || type === 'post_promotion') {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users(email)
        `)
        .eq('is_promoted', true);

      if (postId) {
        query = query.eq('id', postId);
      }

      const { data: promotedPosts, error: promoError } = await query;

      if (!promoError && promotedPosts) {
        const formattedRequests = promotedPosts.map(post => ({
          ...post,
          type: 'post_promotion',
          status: 'approved'
        }));
        requests.push(...formattedRequests);
      }
    }

    console.log('✅ UNIFIED API - Successfully fetched requests:', requests.length);
    return NextResponse.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('❌ UNIFIED API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
