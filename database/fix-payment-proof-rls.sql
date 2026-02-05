-- Fix RLS policies for payment proofs access
-- Run this in your production Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete post photos" ON storage.objects;

-- Create simple public access policy for payment proofs
CREATE POLICY "Public read access to payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs'
);

-- Create admin access policy for payment proofs (for uploads/updates/deletes)
CREATE POLICY "Admin full access to payment proofs" ON storage.objects
FOR ALL USING (
    bucket_id = 'payment-proofs' AND 
    (
        -- Allow authenticated users (admin role check will be in application layer)
        auth.role() = 'authenticated'
    )
);

-- Create public access policy for post photos
CREATE POLICY "Public read access to post photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'post-photos'
);

-- Verify policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Test access to payment proofs
SELECT COUNT(*) as payment_proofs_count FROM storage.objects WHERE bucket_id = 'payment-proofs';

-- Test public URL generation
SELECT 
    'https://xwermvzetnztsxkfqjwe.supabase.co/storage/v1/object/public/payment-proofs/' || name as public_url
FROM storage.objects 
WHERE bucket_id = 'payment-proofs' 
LIMIT 3;
