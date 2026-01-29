import { NextResponse } from 'next/server';
import { supabaseClientServer } from '@/lib/supabase-client-server';

interface PostWithPhoto {
  id: string;
  post_type: string;
  work: string;
  photo_url: string | null;
  created_at: string;
  status: string;
}

export async function GET() {
  try {
    if (!supabaseClientServer) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // Get recent posts with photo URLs
    const { data: posts, error } = await supabaseClientServer
      .from('posts')
      .select('id, post_type, work, photo_url, created_at, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check storage bucket
    const { data: buckets } = await supabaseClientServer.storage.listBuckets();
    const postPhotosBucket = buckets?.find((b: any) => b.name === 'post-photos');

    // List recent files in storage
    let storageFiles: Array<{ name: string; id: string; created_at: string }> = [];
    if (postPhotosBucket) {
      const { data: files } = await supabaseClientServer.storage
        .from('post-photos')
        .list('', { limit: 10 });
      storageFiles = files || [];
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      storageInfo: {
        bucketExists: !!postPhotosBucket,
        bucketPublic: postPhotosBucket?.public || false,
        files: storageFiles
      },
      analysis: {
        totalPosts: posts?.length || 0,
        postsWithPhotos: posts?.filter((p: PostWithPhoto) => p.photo_url).length || 0,
        employeePostsWithPhotos: posts?.filter((p: PostWithPhoto) => p.post_type === 'employee' && p.photo_url).length || 0,
        employerPostsWithPhotos: posts?.filter((p: PostWithPhoto) => p.post_type === 'employer' && p.photo_url).length || 0,
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
