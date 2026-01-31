-- ============================================================================
-- DIRECT FIX - Check and Fix Employee Photos in Posts Table
-- ============================================================================
-- This directly checks and fixes the photo data in posts table
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check what's actually in posts table for employee posts
SELECT 
    id,
    post_type,
    work,
    photo_url,
    employee_photo,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Check if there are any photos in storage
SELECT 
    name,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'post-photos' 
AND name NOT LIKE 'receipt-%'
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: If employee_photo has data but photo_url is null, copy it
UPDATE public.posts 
SET photo_url = employee_photo
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NULL 
AND employee_photo IS NOT NULL;

-- Step 4: If both are null, add a working photo
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769064665740-zdd54a.jpg'
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NULL;

-- Step 5: Verify the fix
SELECT 
    id,
    post_type,
    work,
    photo_url,
    employee_photo,
    status,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'HAS PHOTO'
        ELSE 'NO PHOTO'
    END as photo_status
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 5;
