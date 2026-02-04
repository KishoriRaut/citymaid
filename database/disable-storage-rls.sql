-- Disable RLS on storage table (temporary fix)
-- Run this in your production Supabase SQL Editor

-- Disable Row Level Security on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT tablename, rowsecurity, forcerlspolicy 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Check current policies
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
