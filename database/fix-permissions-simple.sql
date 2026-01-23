-- ============================================================================
-- Fix: Grant execute permissions for get_public_posts() function
-- ============================================================================
-- Run this in Supabase SQL Editor to fix permission issues
-- ============================================================================

-- Grant execute permission to anon role (for public/unauthenticated users)
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon;

-- Grant execute permission to authenticated role (for logged-in users)
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO authenticated;

-- Grant execute permission to public role (covers all users)
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO public;

-- Verify permissions were granted
SELECT 
    has_function_privilege('anon', 'public.get_public_posts()', 'EXECUTE') as anon_can_execute,
    has_function_privilege('authenticated', 'public.get_public_posts()', 'EXECUTE') as authenticated_can_execute,
    has_function_privilege('public', 'public.get_public_posts()', 'EXECUTE') as public_can_execute;

-- Test the function
SELECT COUNT(*) as approved_posts_count FROM get_public_posts();
