-- Debug Employee Photo Issues
-- Run this in Supabase SQL Editor to diagnose photo problems

-- 1. Check if employee posts have photo_url values
SELECT 
    post_type,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
GROUP BY post_type;

-- 2. Show sample employee posts with photo_url status
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'post-photos';

-- 4. Check storage objects (photos)
SELECT 
    bucket_id,
    name,
    created_at,
    updated_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test RPC function returns photo_url for employees
SELECT 
    id,
    post_type,
    work,
    photo_url,
    contact,
    status
FROM get_public_posts()
WHERE post_type = 'employee'
LIMIT 5;

-- 6. Check RLS policies on posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts';

-- 7. Check if there are any approved employee posts
SELECT 
    COUNT(*) as approved_employee_posts,
    COUNT(photo_url) as approved_with_photos
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved';
