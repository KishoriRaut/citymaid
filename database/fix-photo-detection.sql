-- Fix the photo detection regex pattern
-- The current regex is not properly detecting employee photos

-- 1. Show the actual photo URLs and test the regex
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE '%receipt-%' THEN 'PAYMENT_RECEIPT'
        WHEN photo_url ~ '1769[0-9]+-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 'EMPLOYEE_PHOTO_CORRECT'
        WHEN photo_url ~ '^[0-9]+-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 'EMPLOYEE_PHOTO_GENERAL'
        ELSE 'OTHER_OR_NO_PHOTO'
    END as photo_status_corrected
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
AND photo_url IS NOT NULL
ORDER BY created_at DESC;

-- 2. Show all available employee photos in storage
SELECT 
    name,
    created_at,
    CASE 
        WHEN name LIKE 'receipt-%' THEN 'PAYMENT_RECEIPT'
        WHEN name ~ '1769[0-9]+-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 'EMPLOYEE_PHOTO'
        ELSE 'OTHER'
    END as photo_type,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
AND name NOT LIKE 'receipt-%'
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count how many employee posts have valid employee photos vs no photos
SELECT 
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'PAYMENT_RECEIPT'
        WHEN photo_url ~ '1769[0-9]+-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 'EMPLOYEE_PHOTO'
        ELSE 'OTHER'
    END as photo_status,
    COUNT(*) as count
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
GROUP BY photo_status;
