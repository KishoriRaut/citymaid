-- ============================================================================
-- Simple RLS Fix - Allow Public Access to Approved Posts
-- ============================================================================
-- This fixes RLS to allow public users to see approved posts with photos
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check current RLS policies
SELECT 
    'Current Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Step 2: Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert posts" ON public.posts;

-- Step 3: Create simple policy for public access to approved posts
CREATE POLICY "Public read approved posts" ON public.posts
    FOR SELECT
    USING (status = 'approved')
    TO anon, authenticated;

-- Step 4: Create policy for public to insert posts
CREATE POLICY "Public insert posts" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending')
    TO anon, authenticated;

-- Step 5: Admin policy for service role
CREATE POLICY "Service role full access" ON public.posts
    FOR ALL
    TO service_role;

-- Step 6: Test the fix
SELECT 
    'Test After Fix' as test_type,
    COUNT(*) as total_approved_posts,
    COUNT(photo_url) as posts_with_photos
FROM public.posts 
WHERE status = 'approved';

-- Step 7: Show final policies
SELECT 
    'Final Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;
