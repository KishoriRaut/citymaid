-- Check current permissions and status (FIXED)
-- Run this in your production Supabase SQL Editor

-- Check your current role
SELECT current_role, current_user;

-- Check if storage.objects table exists and its RLS status
SELECT 
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Check existing storage policies (read-only)
SELECT 
    policyname,
    tablename,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Check if there are any existing files in storage
SELECT bucket_id, COUNT(*) as file_count
FROM storage.objects 
GROUP BY bucket_id;

-- Check what buckets exist
SELECT id, name, public FROM storage.buckets ORDER BY id;
