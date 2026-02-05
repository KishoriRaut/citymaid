-- Simple Bucket Fix - Works with Standard Permissions
-- Run this in your production Supabase SQL Editor

-- Step 1: Check if bucket exists
SELECT 'Checking bucket existence...' as status;

-- Step 2: Create bucket if it doesn't exist (using INSERT ... ON CONFLICT)
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

-- Step 3: Enable RLS on storage.objects (if needed)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple public read policy
CREATE POLICY "Public read access to payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'payment-proofs')
);

-- Step 5: Create authenticated insert policy
CREATE POLICY "Authenticated insert access to payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'payment-proofs') AND
    auth.role() = 'authenticated'
);

-- Step 6: Verify bucket was created
SELECT 
    'Bucket Verification' as step,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'payment-proofs';

-- Step 7: Verify policies
SELECT 
    'Policy Verification' as step,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%payment proofs%'
ORDER BY policyname;

-- Step 8: Test access
SELECT 
    'Access Test' as step,
    COUNT(*) as total_objects
FROM storage.objects 
WHERE bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'payment-proofs');

-- Step 9: Complete
SELECT 
    'Status' as step,
    'Payment-proofs bucket setup completed!' as message,
    NOW() as completed_at;
