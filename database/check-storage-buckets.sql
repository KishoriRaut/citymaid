-- Check what storage buckets exist and their contents
-- Run this in your production Supabase SQL Editor

-- Check existing buckets
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
ORDER BY id;

-- Check existing policies on storage objects
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

-- Check if there are any files in the buckets
SELECT bucket_id, name, created_at, metadata
FROM storage.objects 
ORDER BY bucket_id, created_at DESC
LIMIT 10;

-- Check storage permissions for your user
SELECT * FROM storage.objects LIMIT 1;
