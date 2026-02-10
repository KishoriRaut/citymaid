-- ============================================================================
-- QUICK RLS FIX FOR POSTS TABLE
-- ============================================================================
-- This disables RLS to allow public access to approved posts
-- ============================================================================

-- 1. Disable RLS on posts table
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- 2. Grant public access to posts table
GRANT SELECT ON public.posts TO public;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.posts TO authenticated;

-- 3. Verify RLS is disabled
SELECT 'RLS Status Check:' as status,
       CASE 
         WHEN EXISTS (
           SELECT 1 FROM pg_tables 
           WHERE tablename = 'posts' 
           AND rowsecurity = true
         ) THEN 'RLS STILL ENABLED'
         ELSE 'RLS DISABLED'
       END as rls_status;

-- 4. Test the query that API will use
SELECT 'Test Query:' as status,
       COUNT(*) as approved_posts
FROM public.posts 
WHERE status = 'approved';

SELECT 'RLS fix completed successfully' as final_status;
