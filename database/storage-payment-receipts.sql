-- ============================================================================
-- Storage Bucket Setup: payment-receipts
-- ============================================================================
-- This bucket stores payment receipt files (images and PDFs) uploaded by users
-- Separate from post-photos bucket for better organization and security
-- ============================================================================

-- IMPORTANT: Storage buckets must be created via Supabase Dashboard
-- The SQL INSERT below may not work due to permissions
-- 
-- MANUAL SETUP REQUIRED:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: "payment-receipts"
-- 4. Public bucket: YES (check the box) - needed for admin to view receipts
-- 5. File size limit: 5MB (5242880 bytes)
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
-- 7. Click "Create bucket"
--
-- OR try the SQL below (may require superuser permissions):

-- Attempt to create bucket (may fail if you don't have permissions)
-- If this fails, create it manually via Dashboard > Storage
DO $$
BEGIN
  -- Check if bucket already exists
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-receipts') THEN
    -- Try to create the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'payment-receipts', 
      'payment-receipts', 
      true, 
      5242880, 
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Cannot create bucket via SQL. Please create "payment-receipts" bucket manually in Dashboard > Storage.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating bucket: %. Please create "payment-receipts" bucket manually in Dashboard > Storage.', SQLERRM;
END $$;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can read payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage payment receipts" ON storage.objects;

-- Policy: Allow public to upload payment receipts
CREATE POLICY "Public can upload payment receipts" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts');

-- Policy: Allow public to read payment receipts (needed for admin to view)
CREATE POLICY "Public can read payment receipts" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'payment-receipts');

-- Policy: Allow admin (service_role) to manage payment receipts
-- This allows admins to delete receipts if needed
CREATE POLICY "Admin can manage payment receipts" ON storage.objects
  FOR ALL
  USING (bucket_id = 'payment-receipts' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'payment-receipts' AND auth.role() = 'service_role');

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Uncomment to verify bucket and policies were created:
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'payment-receipts';

-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects'
-- AND policyname LIKE '%payment%';
