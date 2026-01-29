import { NextResponse } from 'next/server';
import { uploadPhoto } from '@/lib/storage';

export async function GET() {
  try {
    const results = {
      uploadTest: null as { url: string | null; error: string | null; accessible?: boolean; status?: number; fetchError?: string } | null,
      storageInfo: null,
      errors: [] as string[]
    };

    // 1. Test with a simple test image (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const binaryString = atob(testImageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const testFile = new File([bytes], 'test.png', { type: 'image/png' });
    
    // 2. Test the upload
    const uploadResult = await uploadPhoto(testFile);
    results.uploadTest = uploadResult;

    // 3. Check if we can access the uploaded URL
    if (uploadResult.url) {
      try {
        const response = await fetch(uploadResult.url, { method: 'HEAD' });
        results.uploadTest.accessible = response.ok;
        results.uploadTest.status = response.status;
      } catch (fetchError) {
        results.uploadTest.accessible = false;
        results.uploadTest.fetchError = fetchError.message;
      }
    }

    // 4. Check storage bucket info
    try {
      const { supabaseClient } = await import('@/lib/supabase-client');
      const { data: buckets } = await supabaseClient.storage.listBuckets();
      const postPhotosBucket = buckets?.find(b => b.name === 'post-photos');
      
      results.storageInfo = {
        bucketExists: !!postPhotosBucket,
        bucketPublic: postPhotosBucket?.public || false,
        bucketDetails: postPhotosBucket
      };

      // List recent files
      const { data: files } = await supabaseClient.storage
        .from('post-photos')
        .list('', { limit: 5 });
      
      results.recentFiles = files?.map(f => ({
        name: f.name,
        size: f.size,
        created_at: f.created_at
      }));

    } catch (storageError) {
      results.errors.push(`Storage error: ${storageError.message}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0 && !!results.uploadTest?.url,
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
