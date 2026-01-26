import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const postId = 'e277ce8c-6d66-4ca7-b85a-1d6c9e7fcd91';
    
    const { data, error } = await supabase
      .from('posts')
      .update({ 
        homepage_payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, details: error });
    }

    return NextResponse.json({ 
      success: true,
      post: data,
      new_status: data?.homepage_payment_status
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
