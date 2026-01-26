import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get promoted posts (approved homepage payments)
    const { data: promotedPosts, error: promotedError } = await supabase
      .from("posts")
      .select("id, work, homepage_payment_status")
      .eq("status", "approved")
      .eq("homepage_payment_status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);

    if (promotedError) {
      return NextResponse.json({ error: promotedError.message });
    }

    return NextResponse.json({ 
      promoted_posts: promotedPosts || [],
      count: promotedPosts?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' });
  }
}
