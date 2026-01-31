-- ============================================================================
-- Fix RLS Policies for Public Photo Access
-- ============================================================================
-- This fixes RLS policies to allow public access to posts
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Enable RLS on posts table (if not already enabled)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies that might be blocking access
DROP POLICY IF EXISTS ON public.posts;

-- Step 3: Create policy for public users to read approved posts
CREATE POLICY "Public can read approved posts" ON public.posts
    FOR SELECT
    USING (status = 'approved')
    WITH CHECK (status = 'approved')
    TO anon, authenticated;

-- Step 4: Create policy for public users to insert posts
CREATE POLICY "Public can insert posts" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending')
    TO anon, authenticated;

-- Step 5: Create policy for service role (admin) to have full access
CREATE POLICY "Service role full access" ON public.posts
    FOR ALL
    TO service_role;

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 7: Test the policies
SELECT 
    'Policy Test' as test_type,
    COUNT(*) as accessible_posts
FROM public.posts 
WHERE status = 'approved';

-- Step 8: Test if anon can now access the function
SELECT 
    'Function Access Test' as test_type,
    COUNT(*) as accessible_posts
FROM get_public_posts()
LIMIT 5;

-- Step 9: Show current RLS policies
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
