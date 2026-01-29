import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 DEBUG - Checking database state...');
    
    // Check posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, work, contact, status, homepage_payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('🔧 DEBUG - Posts:', { posts: posts?.length, postsError });

    // Check payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, post_id, visitor_id, amount, status, receipt_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('🔧 DEBUG - Payments:', { payments: payments?.length, paymentsError });

    // Check specific post that's failing
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    
    let specificPost = null;
    let specificPayments = null;
    
    if (postId) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      const { data: postPayments, error: postPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('post_id', postId);

      specificPost = { post, postError };
      specificPayments = { postPayments, postPaymentsError };
      
      console.log('🔧 DEBUG - Specific post:', { post, postError });
      console.log('🔧 DEBUG - Specific post payments:', { postPayments, postPaymentsError });
    }

    return NextResponse.json({
      success: true,
      data: {
        posts: {
          count: posts?.length || 0,
          data: posts || [],
          error: postsError
        },
        payments: {
          count: payments?.length || 0,
          data: payments || [],
          error: paymentsError
        },
        specificPost,
        specificPayments
      }
    });

  } catch (error) {
    console.error('❌ DEBUG - Error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: error },
      { status: 500 }
    );
  }
}
