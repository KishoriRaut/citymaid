import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🏠 Testing homepage API...');
    
    // Test the exact same query as the homepage uses
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        post_type,
        work,
        time,
        place,
        salary,
        contact,
        details,
        photo_url,
        employee_photo,
        status,
        created_at
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(0, 11); // First page, 12 posts

    if (error) {
      console.error('❌ Homepage query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Homepage query returned ${posts?.length || 0} posts`);

    return NextResponse.json({
      success: true,
      posts: posts || [],
      count: posts?.length || 0,
      query: 'status = approved, ordered by created_at desc, limit 12'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test homepage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
