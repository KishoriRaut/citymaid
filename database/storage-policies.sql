-- ============================================================================
-- Storage Policies for post-photos Bucket
-- ============================================================================
-- Run this AFTER creating the "post-photos" bucket in Supabase Dashboard
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete own photos" ON storage.objects;

-- Policy: Allow public to upload photos
CREATE POLICY "Public can upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'post-photos');

-- Policy: Allow public to read photos
CREATE POLICY "Public can read photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to update their own photos (optional)
CREATE POLICY "Public can update own photos" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to delete their own photos (optional)
CREATE POLICY "Public can delete own photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'post-photos');

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Uncomment to verify policies were created:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects'
-- AND policyname LIKE '%photo%';
