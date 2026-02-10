import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Find a post that doesn't have homepage promotion
    const { data, error } = await supabase
      .from('posts')
      .select('id, work, homepage_payment_status')
      .eq('status', 'approved')
      .neq('homepage_payment_status', 'approved')
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ 
      post: data?.[0] || null,
      count: data?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
