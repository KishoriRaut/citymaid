import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('contact_unlock_requests')
      .select('id, post_id, status, visitor_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' });
  }
}
