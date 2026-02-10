-- ============================================================================
-- SIMPLE DIAGNOSTIC: CHECK CURRENT STATE
-- ============================================================================
-- Run this to see what's actually in your database
-- ============================================================================

-- Check if posts table exists and has data
SELECT 
    'Posts table exists: ' || EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'posts'
    ) as status,
    'Posts record count: ' || COUNT(*) || ' records' as count
FROM public.posts
LIMIT 1;

-- Check current RLS policies on posts table
SELECT 
    'Current RLS policies: ' || COUNT(*) || ' policies' as status
FROM pg_policies 
WHERE tablename = 'posts';

-- Sample posts data to verify structure
SELECT 
    id,
    post_type,
    work,
    status,
    created_at
FROM public.posts 
LIMIT 3;

SELECT 'Diagnostic complete - check results above' as status;
