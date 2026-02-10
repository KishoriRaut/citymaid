import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check all posts with their status
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('id, work, status, created_at, post_type')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allPostsError) {
      return NextResponse.json({ error: allPostsError.message }, { status: 500 });
    }

    // Check approved posts specifically
    const { data: approvedPosts, error: approvedError } = await supabase
      .from('posts')
      .select('id, work, status, created_at, post_type')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    if (approvedError) {
      return NextResponse.json({ error: approvedError.message }, { status: 500 });
    }

    // Check payments and their status
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, post_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    return NextResponse.json({
      allPosts: allPosts || [],
      approvedPosts: approvedPosts || [],
      payments: payments || [],
      summary: {
        totalPosts: allPosts?.length || 0,
        approvedPosts: approvedPosts?.length || 0,
        totalPayments: payments?.length || 0
      }
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ 
      error: 'Failed to check posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
