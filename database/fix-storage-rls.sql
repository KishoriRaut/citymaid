-- Fix RLS policies for storage buckets
-- Run this in your production Supabase SQL Editor

-- Drop existing policies on storage.objects
DROP POLICY IF EXISTS "Allow all operations on payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on post-photos" ON storage.objects;

-- Create permissive policies for payment-proofs bucket
CREATE POLICY "Allow insert on payment-proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Allow select on payment-proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Allow update on payment-proofs" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-proofs');

CREATE POLICY "Allow delete on payment-proofs" ON storage.objects
FOR DELETE USING (bucket_id = 'payment-proofs');

-- Create permissive policies for post-photos bucket
CREATE POLICY "Allow insert on post-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'post-photos');

CREATE POLICY "Allow select on post-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'post-photos');

CREATE POLICY "Allow update on post-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'post-photos');

CREATE POLICY "Allow delete on post-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'post-photos');

-- Verify policies were created
SELECT 
    policyname,
    tablename,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
