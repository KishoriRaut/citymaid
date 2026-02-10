-- COMPLETE BUCKET FIX - Single SQL Script
-- Run this in your Supabase SQL Editor (if you have permissions)
-- If this fails, use the Supabase Dashboard approach instead

-- First, let's check what we can do with current permissions
SELECT 'Current permissions check:' as info;

-- Check if storage schema exists
SELECT schemaname, tablename FROM information_schema.tables WHERE schemaname = 'storage' AND tablename = 'buckets';

-- Check existing buckets
SELECT id, name, public FROM storage.buckets ORDER BY name;

-- Try to create bucket with INSERT ... ON CONFLICT (should work with standard permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
    gen_random_uuid() as id,
    'payment-proofs' as name,
    true as public,
    5242880 as file_size_limit,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'] as allowed_mime_types
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'payment-proofs'
);

-- Try to enable RLS (may fail with permissions)
DO $$
BEGIN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS enable failed: %, continuing...', SQLERRM;
END $$;

-- Try to create policies (may fail with permissions)
DO $$
BEGIN
    -- Public read policy
    EXECUTE 'CREATE POLICY "Public read access to payment proofs" ON storage.objects FOR SELECT USING (bucket_id IN (SELECT id FROM storage.buckets WHERE name = ''payment-proofs''))';
    
    -- Authenticated insert policy  
    EXECUTE 'CREATE POLICY "Authenticated insert access to payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN (SELECT id FROM storage.buckets WHERE name = ''payment-proofs'') AND auth.role() = ''authenticated'')';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $$;

-- Final verification
SELECT 'Final verification:' as info;

-- Check if bucket was created
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE name = 'payment-proofs';

-- Check policies that exist
SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%payment proofs%' ORDER BY policyname;

-- Test object access
SELECT COUNT(*) as objects_in_bucket FROM storage.objects WHERE bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'payment-proofs');

-- Generate working URL format
SELECT 'https://xwermvzetnztsxkfqjwe.supabase.co/storage/v1/object/public/payment-proofs/YOUR_FILE_NAME.jpg' as example_url;

SELECT 'Bucket fix script completed!' as status, NOW() as completed_at;
