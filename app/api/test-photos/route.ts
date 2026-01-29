import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const results = {
      databasePosts: [] as Array<{ id: string; work: string; post_type: string; photo_url: string | null; created_at: string }>,
      storageInfo: null as { buckets: Array<{ name: string; id: string }> | undefined; postPhotosExists: boolean; postPhotosBucket: any } | null,
      photoTest: null as { url: string; status: number; statusText: string; accessible: boolean } | { url: string; error: string; accessible: boolean } | null,
      storageFiles: null as Array<{ name: string; size: number; created_at: string }> | null,
      errors: [] as string[]
    };

    // 1. Check recent posts from database
    if (!supabaseClient) {
      results.errors.push('Supabase client not initialized');
    } else {
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
    }

    // 2. Check storage bucket info
    if (supabaseClient) {
      try {
        const { data: buckets } = await supabaseClient.storage.listBuckets();
        const postPhotosBucket = buckets?.find(b => b.name === 'post-photos');
        results.storageInfo = {
          buckets: buckets?.map(b => ({ name: b.name, id: b.id })),
          postPhotosExists: !!postPhotosBucket,
          postPhotosBucket: postPhotosBucket
        };
      } catch (bucketError) {
        results.errors.push(`Bucket error: ${bucketError instanceof Error ? bucketError.message : 'Unknown error'}`);
      }
    }

    // 3. Test a specific photo URL if available
    const postWithPhoto = results.databasePosts?.find((p: any) => p.photo_url);
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
          error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          accessible: false
        };
      }
    }

    // 4. List files in storage bucket
    if (supabaseClient) {
      try {
        const { data: files } = await supabaseClient.storage
          .from('post-photos')
          .list('', { limit: 10 });
        
        results.storageFiles = files?.map((f: any) => ({
          name: f.name,
          size: f.size || 0,
          created_at: f.created_at
        })) || [];
      } catch (listError) {
        results.errors.push(`List files error: ${listError instanceof Error ? listError.message : 'Unknown error'}`);
      }
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
