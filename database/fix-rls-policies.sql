-- ============================================================================
-- FIX RLS POLICIES FOR PUBLIC POST INSERTION
-- ============================================================================
-- Run this script to allow public users to insert posts
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Posts policy" ON public.posts;

-- Create new policies that allow public insertion
CREATE POLICY "Public can insert posts" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Service role full access" ON public.posts
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow public to read approved posts via function
CREATE POLICY "Public can read approved posts" ON public.posts
    FOR SELECT
    USING (status = 'approved');

SELECT 'RLS policies updated successfully' as status;
