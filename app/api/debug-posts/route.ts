import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking posts...');
    
    // Get all posts with their status
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('id, work, status, created_at, post_type, contact')
      .order('created_at', { ascending: false });

    if (allPostsError) {
      console.error('❌ Error fetching all posts:', allPostsError);
      return NextResponse.json({ error: allPostsError.message }, { status: 500 });
    }

    // Get only approved posts
    const { data: approvedPosts, error: approvedError } = await supabase
      .from('posts')
      .select('id, work, status, created_at, post_type, contact')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (approvedError) {
      console.error('❌ Error fetching approved posts:', approvedError);
      return NextResponse.json({ error: approvedError.message }, { status: 500 });
    }

    // Get payments and their relationship to posts
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, post_id, status, created_at')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    // Check for posts that should be approved based on payments
    const approvedPaymentIds = payments?.filter(p => p.status === 'approved').map(p => p.post_id) || [];
    const postsThatShouldBeApproved = allPosts?.filter(post => approvedPaymentIds.includes(post.id)) || [];

    console.log('📊 Debug Results:', {
      totalPosts: allPosts?.length || 0,
      approvedPosts: approvedPosts?.length || 0,
      totalPayments: payments?.length || 0,
      approvedPayments: payments?.filter(p => p.status === 'approved').length || 0,
      postsThatShouldBeApproved: postsThatShouldBeApproved.length
    });

    return NextResponse.json({
      debug: {
        allPosts: allPosts || [],
        approvedPosts: approvedPosts || [],
        payments: payments || [],
        postsThatShouldBeApproved,
        summary: {
          totalPosts: allPosts?.length || 0,
          approvedPosts: approvedPosts?.length || 0,
          totalPayments: payments?.length || 0,
          approvedPayments: payments?.filter(p => p.status === 'approved').length || 0,
          postsThatShouldBeApproved: postsThatShouldBeApproved.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
