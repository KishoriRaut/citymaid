-- Comprehensive Bucket Creation and Verification
-- Run this in your production Supabase SQL Editor
-- This will completely recreate the payment-proofs bucket

-- Step 1: Check if storage system exists
DO $$
BEGIN
    -- Check if storage schema exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'storage'
    ) THEN
        RAISE EXCEPTION 'Storage schema does not exist. Please run storage initialization first.';
    END IF;
END $$;

-- Step 2: Completely drop existing bucket (if any)
DELETE FROM storage.buckets WHERE name = 'payment-proofs';

-- Step 3: Create the payment-proofs bucket with proper settings
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at
) VALUES (
    gen_random_uuid(),
    'payment-proofs',
    true,  -- Make bucket public
    5242880,  -- 5MB limit
    ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'application/pdf'
    ],
    NOW()
);

-- Step 4: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop all existing policies for this bucket
DROP POLICY IF EXISTS "Public read access to payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow read access to payment-proofs" ON storage.objects;

-- Step 6: Create comprehensive RLS policies
-- Policy 1: Public read access
CREATE POLICY "Public read access to payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'payment-proofs')
);

-- Policy 2: Authenticated users can insert (upload)
CREATE POLICY "Authenticated insert access to payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'payment-proofs') AND
    auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update
CREATE POLICY "Authenticated update access to payment proofs" ON storage.objects
FOR UPDATE USING (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'payment-proofs') AND
    auth.role() = 'authenticated'
);

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated delete access to payment proofs" ON storage.objects
FOR DELETE USING (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'payment-proofs') AND
    auth.role() = 'authenticated'
);

-- Step 7: Verify bucket creation
SELECT 
    'Bucket Verification' as step,
    id,
    name,
    public,
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE name = 'payment-proofs';

-- Step 8: Verify policies
SELECT 
    'Policy Verification' as step,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (
    qual LIKE '%payment-proofs%' OR
    policyname LIKE '%payment-proofs%'
)
ORDER BY policyname;

-- Step 9: Test bucket access
SELECT 
    'Access Test' as step,
    COUNT(*) as total_objects_in_bucket
FROM storage.objects 
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'payment-proofs');

-- Step 10: Generate test URL format
SELECT 
    'URL Format Test' as step,
    'https://xwermvzetnztsxkfqjwe.supabase.co/storage/v1/object/public/payment-proofs/test.jpg' as example_url;

-- Step 11: Complete
SELECT 
    'Status' as step,
    'Payment-proofs bucket creation completed successfully!' as message,
    NOW() as completed_at;
