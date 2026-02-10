import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check posts with homepage payment status
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        work,
        homepage_payment_status,
        created_at
      `)
      .in('homepage_payment_status', ['pending', 'paid', 'approved'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching homepage posts:', error);
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ 
      posts: posts || [],
      count: posts?.length || 0
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' });
  }
}
