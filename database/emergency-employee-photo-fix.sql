-- ============================================================================
-- Emergency Employee Photo Fix Script
-- ============================================================================
-- This script checks and fixes employee photo data that might be missing
-- Run this in Supabase SQL Editor to fix employee photo display issues
-- ============================================================================

-- First, let's check the current state of employee photos
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
AND status IN ('pending', 'approved', 'hidden')
ORDER BY created_at DESC
LIMIT 10;

-- Count employee posts with and without photos
SELECT 
    COUNT(*) as total_employee_posts,
    COUNT(CASE WHEN employee_photo IS NOT NULL THEN 1 END) as with_employee_photo,
    COUNT(CASE WHEN photo_url IS NOT NULL THEN 1 END) as with_photo_url,
    COUNT(CASE WHEN employee_photo IS NULL AND photo_url IS NULL THEN 1 END) as no_photos
FROM public.posts 
WHERE post_type = 'employee';

-- If employee_photo column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'employee_photo'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN employee_photo TEXT;
        RAISE NOTICE 'Added employee_photo column';
    END IF;
END $$;

-- Migrate existing employee photos from photo_url to employee_photo
-- Only for employee posts that have photo_url but no employee_photo
UPDATE public.posts 
SET employee_photo = photo_url,
    photo_url = NULL  -- Clear photo_url for employee posts (it's for payment receipts)
WHERE post_type = 'employee' 
AND photo_url IS NOT NULL 
AND employee_photo IS NULL;

-- Verify the migration
SELECT 
    id,
    post_type,
    work,
    photo_url as payment_receipt_url,
    employee_photo as profile_photo_url,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
AND status IN ('pending', 'approved', 'hidden')
ORDER BY created_at DESC
LIMIT 5;

-- Final count check
SELECT 
    'After Migration' as status,
    COUNT(*) as total_employee_posts,
    COUNT(CASE WHEN employee_photo IS NOT NULL THEN 1 END) as with_employee_photo,
    COUNT(CASE WHEN photo_url IS NOT NULL THEN 1 END) as with_payment_receipt,
    COUNT(CASE WHEN employee_photo IS NULL AND photo_url IS NULL THEN 1 END) as no_photos
FROM public.posts 
WHERE post_type = 'employee';
