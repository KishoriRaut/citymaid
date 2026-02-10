-- ============================================================================
-- QUICK DATABASE CHECK FOR PUBLIC POSTS
-- ============================================================================
-- Run this in Supabase SQL Editor to verify setup
-- ============================================================================

-- Check if posts table exists and has data
SELECT 'Posts table check:' as info,
       COUNT(*) as total_posts,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_posts
FROM public.posts;

-- Check table structure
SELECT 'Posts table columns:' as info,
       column_name, 
       data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'posts'
  AND column_name IN ('id', 'post_type', 'status', 'work', 'contact', 'created_at');

-- Test direct query (what the simple API will use)
SELECT 'Direct query test:' as info,
       id, post_type, status, work, contact, created_at
FROM public.posts 
WHERE status = 'approved' 
ORDER BY created_at DESC 
LIMIT 5;
