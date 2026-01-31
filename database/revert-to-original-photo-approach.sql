-- ============================================================================
-- Revert to Original Working Photo Approach
-- ============================================================================
-- This makes employee posts use photo_url for display (like it worked before)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Move employee photos back to photo_url field for display
UPDATE public.posts 
SET photo_url = employee_photo
WHERE post_type = 'employee' 
AND employee_photo IS NOT NULL
AND photo_url IS NULL;

-- Step 2: Clear employee_photo field (we'll use photo_url for all posts)
UPDATE public.posts 
SET employee_photo = NULL
WHERE post_type = 'employee';

-- Step 3: Update get_public_posts to only use photo_url (like original)
DROP FUNCTION IF EXISTS public.get_public_posts();

CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Only show contact if there's an approved payment for this post
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Step 5: Test the results
SELECT 
    'After Fix Results' as step,
    COUNT(*) as total_approved_posts,
    COUNT(CASE WHEN post_type = 'employee' THEN 1 END) as employee_posts,
    COUNT(CASE WHEN post_type = 'employee' AND photo_url IS NOT NULL THEN 1 END) as employee_posts_with_photos,
    COUNT(CASE WHEN post_type = 'employer' THEN 1 END) as employer_posts,
    COUNT(CASE WHEN post_type = 'employer' AND photo_url IS NOT NULL THEN 1 END) as employer_posts_with_photos
FROM get_public_posts();

-- Step 6: Show sample data
SELECT 
    'Sample Employee Posts' as step,
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM get_public_posts() 
WHERE post_type = 'employee' 
LIMIT 3;
