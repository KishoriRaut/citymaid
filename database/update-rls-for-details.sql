-- ============================================================================
-- Update RLS Policies for Details Column
-- ============================================================================
-- This updates RLS policies to include the new details column
-- Run this in Supabase SQL Editor after adding the details column
-- ============================================================================

-- Step 1: Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Public can read approved posts" ON public.posts;
DROP POLICY IF EXISTS "Public can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Service role full access" ON public.posts;

-- Step 2: Create policy for public users to read approved posts (including details)
CREATE POLICY "Public can read approved posts" ON public.posts
    FOR SELECT
    USING (status = 'approved')
    WITH CHECK (status = 'approved')
    TO anon, authenticated;

-- Step 3: Create policy for public users to insert posts (including details)
CREATE POLICY "Public can insert posts" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending')
    TO anon, authenticated;

-- Step 4: Create policy for service role (admin) to have full access
CREATE POLICY "Service role full access" ON public.posts
    FOR ALL
    TO service_role;

-- Step 5: Grant necessary permissions for details column
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT (id, post_type, work, work_other, time, time_other, place, salary, contact, details, photo_url, employee_photo, status, created_at, updated_at) ON public.posts TO anon, authenticated;
GRANT INSERT (post_type, work, work_other, time, time_other, place, salary, contact, details, photo_url, employee_photo, status) ON public.posts TO anon, authenticated;
GRANT UPDATE (post_type, work, work_other, time, time_other, place, salary, contact, details, photo_url, employee_photo, status) ON public.posts TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 6: Test the policies with details column
SELECT 
    'Policy Test with Details' as test_type,
    COUNT(*) as accessible_posts,
    COUNT(CASE WHEN details IS NOT NULL THEN 1 END) as posts_with_details
FROM public.posts 
WHERE status = 'approved';

-- Step 7: Test if anon can now access the function with details
SELECT 
    'Function Access Test with Details' as test_type,
    COUNT(*) as accessible_posts,
    COUNT(CASE WHEN details IS NOT NULL THEN 1 END) as posts_with_details
FROM get_public_posts()
LIMIT 5;

-- Step 8: Show current RLS policies
SELECT 
    'Current RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Step 9: Verify details column is accessible
SELECT 
    'Details Column Access Test' as test_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';
