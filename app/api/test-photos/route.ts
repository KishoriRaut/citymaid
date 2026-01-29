import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const results = {
      databasePosts: [],
      storageInfo: null,
      photoTest: null,
      errors: []
    };

    // 1. Check recent posts from database
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select('id, work, post_type, photo_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      results.errors.push(`Database error: ${postsError.message}`);
    } else {
      results.databasePosts = posts || [];
    }

    // 2. Check storage bucket info
    try {
      const { data: buckets } = await supabaseClient.storage.listBuckets();
      const postPhotosBucket = buckets?.find(b => b.name === 'post-photos');
      results.storageInfo = {
        buckets: buckets?.map(b => ({ name: b.name, id: b.id })),
        postPhotosExists: !!postPhotosBucket,
        postPhotosBucket: postPhotosBucket
      };
    } catch (bucketError) {
      results.errors.push(`Bucket error: ${bucketError}`);
    }

    // 3. Test a specific photo URL if available
    const postWithPhoto = posts?.find(p => p.photo_url);
    if (postWithPhoto?.photo_url) {
      try {
        const response = await fetch(postWithPhoto.photo_url, { method: 'HEAD' });
        results.photoTest = {
          url: postWithPhoto.photo_url,
          status: response.status,
          statusText: response.statusText,
          accessible: response.ok
        };
      } catch (fetchError) {
        results.photoTest = {
          url: postWithPhoto.photo_url,
          error: fetchError.message,
          accessible: false
        };
      }
    }

    // 4. List files in storage bucket
    try {
      const { data: files } = await supabaseClient.storage
        .from('post-photos')
        .list('', { limit: 10 });
      
      results.storageFiles = files?.map(f => ({
        name: f.name,
        size: f.size,
        created_at: f.created_at
      }));
    } catch (listError) {
      results.errors.push(`List files error: ${listError.message}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      timestamp: new Date().toISOString(),
      ...results
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
