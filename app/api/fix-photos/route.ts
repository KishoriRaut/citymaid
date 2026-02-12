import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // Update employee posts to use real photos
    const { error: employeeError } = await supabase
      .from('posts')
      .update({ 
        photo_url: 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769064665740-zdd54a.jpg' 
      })
      .eq('post_type', 'employee')
      .eq('status', 'approved')
      .like('photo_url', '170652%');

    if (employeeError) {
      return NextResponse.json({ error: `Employee update failed: ${employeeError.message}` }, { status: 500 });
    }

    // Update employer posts to use real receipt photos
    const { error: employerError } = await supabase
      .from('posts')
      .update({ 
        photo_url: 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/receipt-1769094508664-5ci5h.webp' 
      })
      .eq('post_type', 'employer')
      .eq('status', 'approved')
      .like('photo_url', 'receipt-1769701270%');

    if (employerError) {
      return NextResponse.json({ error: `Employer update failed: ${employerError.message}` }, { status: 500 });
    }

    // Get updated posts
    const { data: updatedPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, post_type, work, photo_url, status, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      return NextResponse.json({ error: `Fetch failed: ${fetchError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Photo URLs updated successfully',
      updatedPosts: updatedPosts || [],
      employeeUpdated: !employeeError,
      employerUpdated: !employerError
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
