import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('🔍 Simple test API: Starting...');
    
    // Simple direct query without any functions
    const { data, error } = await supabase
      .from('posts')
      .select('id, post_type, work, status')
      .eq('status', 'approved')
      .limit(5);
    
    if (error) {
      console.error('❌ Simple query error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: 'Simple query failed'
      }, { status: 500 });
    }
    
    console.log(`✅ Simple query success: ${data?.length || 0} posts found`);
    
    return NextResponse.json({
      success: true,
      posts: data || [],
      count: data?.length || 0,
      message: 'Simple API working'
    });
    
  } catch (error) {
    console.error('❌ Simple API error:', error);
    return NextResponse.json({ 
      error: 'Simple API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
