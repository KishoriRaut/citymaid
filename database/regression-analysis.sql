-- ============================================================================
-- REGRESSION ANALYSIS - Check What Changed
-- ============================================================================
-- This analyzes what might have caused the photo regression
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Check if photo_url field exists and has data for approved employees
SELECT 
    'Photo Field Analysis' as analysis_type,
    COUNT(*) as total_approved_employees,
    COUNT(photo_url) as employees_with_photos,
    COUNT(*) - COUNT(photo_url) as employees_without_photos,
    ROUND(COUNT(photo_url)::decimal / COUNT(*) * 100, 2) as photo_percentage
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved';

-- 2. Check sample data to see what photo_url contains
SELECT 
    'Sample Employee Data' as analysis_type,
    id,
    post_type,
    work,
    photo_url,
    LENGTH(photo_url) as photo_url_length,
    CASE 
        WHEN photo_url IS NULL THEN 'NULL'
        WHEN photo_url = '' THEN 'EMPTY'
        WHEN photo_url LIKE 'https://%' THEN 'VALID_URL'
        ELSE 'INVALID_FORMAT'
    END as photo_status,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 3;

-- 3. Check if RLS policies changed
SELECT 
    'RLS Policy Check' as analysis_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- 4. Check if storage permissions changed
SELECT 
    'Storage Permissions' as analysis_type,
    bucket_id,
    COUNT(*) as total_files,
    COUNT(CASE WHEN name NOT LIKE 'receipt-%' THEN 1 END) as photo_files
FROM storage.objects 
WHERE bucket_id = 'post-photos'
GROUP BY bucket_id;

-- 5. Check if there are any schema changes
SELECT 
    'Schema Check' as analysis_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('photo_url', 'employee_photo', 'status')
ORDER BY column_name;
