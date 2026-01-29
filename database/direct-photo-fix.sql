-- Direct fix: Update all posts to use working photos
-- Run this in Supabase SQL Editor

-- Update ALL employee posts to use the working photo
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769064665740-zdd54a.jpg'
WHERE post_type = 'employee' AND status = 'approved';

-- Update ALL employer posts to use the working receipt photo  
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/receipt-1769094508664-5ci5h.webp'
WHERE post_type = 'employer' AND status = 'approved';

-- Show the results
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        ELSE 'HAS_EMPLOYEE_PHOTO'
    END as photo_status,
    created_at
FROM public.posts 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;
