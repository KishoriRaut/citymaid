import { createClient } from '@supabase/supabase-js';

async function ensureBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const bucketName = 'payment-proofs';

  try {
    // Check if bucket exists
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);

    if (bucketError && bucketError.message.includes('not found')) {
      // Create bucket if it doesn't exist
      const { data, error: createError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf'],
          fileSizeLimit: 5242880, // 5MB
        });

      if (createError) {
        throw createError;
      }
      console.log(`Created bucket: ${bucketName}`);
    } else if (bucket) {
      console.log(`Bucket exists: ${bucketName}`);
    }

    // Set bucket policies
    const { error: policyError } = await supabase
      .rpc('create_storage_policy', { bucket_name: bucketName });

    if (policyError) {
      console.warn('Error setting bucket policies:', policyError.message);
    } else {
      console.log('Bucket policies updated');
    }

  } catch (error) {
    console.error('Error ensuring bucket:', error);
    process.exit(1);
  }
}

ensureBucket();
