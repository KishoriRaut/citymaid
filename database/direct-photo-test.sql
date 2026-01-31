-- ============================================================================
-- Direct Test - Bypass Function and Test Direct Query
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Test direct query (bypass get_public_posts function)
SELECT 
    'Direct Query Test' as test_type,
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 3;

-- Test if we can manually create a working function
CREATE OR REPLACE FUNCTION test_photo_function()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
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
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the simple function
SELECT 
    'Simple Function Test' as test_type,
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM test_photo_function()
WHERE post_type = 'employee'
LIMIT 3;

-- Grant permissions
GRANT EXECUTE ON FUNCTION test_photo_function() TO anon, authenticated;
