import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const postId = 'e277ce8c-6d66-4ca7-b85a-1d6c9e7fcd91';
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ 
      post: data,
      homepage_payment_status: data?.homepage_payment_status,
      status: data?.status
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
