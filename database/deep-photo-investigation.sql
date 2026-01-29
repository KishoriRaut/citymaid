-- DEEP INVESTIGATION: Why employer photos are not fetching
-- This will identify the exact blocking mechanism

-- 1. Check if ANY employer posts have photo_url values
SELECT 
    COUNT(*) as total_employer_posts,
    COUNT(photo_url) as employer_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employer_posts_without_photos,
    'EMPLOYER POSTS' as post_type
FROM public.posts 
WHERE post_type = 'employer'
GROUP BY post_type

UNION ALL

-- 2. Check if ANY employee posts have photo_url values  
SELECT 
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos,
    'EMPLOYEE POSTS' as post_type
FROM public.posts 
WHERE post_type = 'employee'
GROUP BY post_type;

-- 3. Show actual photo_url values for ALL posts (both types)
SELECT 
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'HAS_PHOTO'
        ELSE 'NO_PHOTO'
    END as photo_status
FROM public.posts 
WHERE status = 'approved'
ORDER BY post_type, created_at DESC
LIMIT 20;

-- 4. Check if photo_url is being set to NULL during post creation
-- Look at the createPost function logic in posts.ts
-- We already know from earlier investigation that this line exists:
-- photo_url: post.post_type === "employer" ? null : post.photo_url || null,

-- 5. Test direct SQL query to see what's actually in the database
SELECT 
    p.id,
    p.post_type,
    p.photo_url,
    p.status,
    p.created_at,
    -- Check if this photo_url exists in storage
    CASE 
        WHEN p.photo_url IS NOT NULL THEN
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM storage.objects so 
                    WHERE so.bucket_id = 'post-photos' 
                    AND p.photo_url LIKE '%' || so.name || '%'
                ) THEN 'FILE_EXISTS_IN_STORAGE'
                ELSE 'FILE_MISSING_FROM_STORAGE'
            END
        ELSE 'NO_PHOTO_URL'
    END as storage_check
FROM public.posts p
WHERE p.post_type = 'employer'
AND p.status = 'approved'
ORDER BY p.created_at DESC
LIMIT 10;

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
WHERE tablename = 'posts' 
AND schemaname = 'public';

-- 7. Test if RPC function returns photo_url for employers
SELECT 
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at
FROM get_public_posts()
WHERE post_type = 'employer'
LIMIT 5;

-- 8. Check if there's a business logic issue - maybe employers should have photos
SELECT 
    'CURRENT_LOGIC' as analysis,
    'Employer posts are forced to photo_url = NULL in createPost function' as issue,
    'Line 169 in lib/posts.ts: photo_url: post.post_type === "employer" ? null : post.photo_url || null' as evidence,
    'This means employers can never have photos regardless of upload' as conclusion;
