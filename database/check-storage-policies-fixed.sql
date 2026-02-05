-- Check storage policies that might be blocking uploads
-- Run this in your production Supabase SQL Editor

-- Check if RLS is enabled on storage.objects
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Check existing storage policies
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

-- Test if you can read from storage.objects
SELECT COUNT(*) as total_objects FROM storage.objects;

-- Check your current role
SELECT current_role, current_user;

-- Check if payment-proofs bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'payment-proofs';

-- Check some sample payment proof objects
SELECT bucket_id, name, created_at FROM storage.objects WHERE bucket_id = 'payment-proofs' LIMIT 5;
