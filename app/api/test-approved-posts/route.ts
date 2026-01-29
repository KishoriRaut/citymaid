import { NextResponse } from 'next/server';
import { supabaseClientServer } from '@/lib/supabase-client-server';

export async function GET() {
  try {
    if (!supabaseClientServer) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // Test specific approved posts that should have photos
    const { data: approvedPosts, error } = await supabaseClientServer
      .from('posts')
      .select('id, post_type, work, photo_url, status, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Test one specific photo URL
    const testPost = approvedPosts?.find(p => p.photo_url);
    let photoTest = null;
    
    if (testPost?.photo_url) {
      try {
        const response = await fetch(testPost.photo_url, { method: 'HEAD' });
        photoTest = {
          url: testPost.photo_url,
          status: response.status,
          statusText: response.statusText,
          accessible: response.ok
        };
      } catch (fetchError) {
        photoTest = {
          url: testPost.photo_url,
          error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          accessible: false
        };
      }
    }

    // Check storage bucket status
    const { data: buckets } = await supabaseClientServer.storage.listBuckets();
    const postPhotosBucket = buckets?.find(b => b.name === 'post-photos');

    return NextResponse.json({
      success: true,
      approvedPosts: approvedPosts || [],
      storageInfo: {
        bucketExists: !!postPhotosBucket,
        bucketPublic: postPhotosBucket?.public || false,
        totalBuckets: buckets?.length || 0
      },
      photoTest,
      analysis: {
        totalApproved: approvedPosts?.length || 0,
        postsWithPhotos: approvedPosts?.filter(p => p.photo_url).length || 0,
        postsWithoutPhotos: approvedPosts?.filter(p => !p.photo_url).length || 0
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
