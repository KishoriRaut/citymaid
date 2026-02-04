import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing client posts API...');
    
    // Test the exact same query that should work
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
      .limit(12);

    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Found ${posts?.length || 0} approved posts`);

    return NextResponse.json({
      success: true,
      posts: posts || [],
      count: posts?.length || 0,
      message: `Found ${posts?.length || 0} approved posts`
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
