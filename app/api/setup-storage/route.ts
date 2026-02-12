import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // 1. Create the post-photos bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('post-photos', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError) {
      // If bucket already exists, that's ok
      if (!bucketError.message.includes('already exists')) {
        return NextResponse.json({ error: `Bucket creation failed: ${bucketError.message}` }, { status: 500 });
      }
    }

    // 2. Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    const postPhotosBucket = buckets?.find(b => b.name === 'post-photos');

    // 3. Create a simple test file to verify upload works
    const testContent = 'test-image-content';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-photos')
      .upload(testFileName, new Blob([testContent]), {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload test failed: ${uploadError.message}` }, { status: 500 });
    }

    // 4. Get public URL
    const { data: urlData } = supabase.storage
      .from('post-photos')
      .getPublicUrl(testFileName);

    // 5. Clean up test file
    await supabase.storage
      .from('post-photos')
      .remove([testFileName]);

    return NextResponse.json({
      success: true,
      message: 'Storage bucket setup completed successfully',
      bucketInfo: {
        created: !bucketError || bucketError.message.includes('already exists'),
        bucket: postPhotosBucket,
        publicUrl: urlData.publicUrl,
        uploadTest: 'PASSED'
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
