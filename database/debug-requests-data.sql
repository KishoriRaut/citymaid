-- ============================================================================
-- Debug Requests Data - Check Why No Requests Showing
-- ============================================================================
-- Run this in Supabase SQL Editor to debug the requests issue
-- ============================================================================

-- Check if payments table exists and has data
SELECT 'Payments Table Check' as info, COUNT(*) as count FROM public.payments;

-- Check if contact_unlock_requests table exists and has data  
SELECT 'Unlock Requests Table Check' as info, COUNT(*) as count FROM public.contact_unlock_requests;

-- Show sample payment records with post data
SELECT 
    p.id as payment_id,
    p.post_id,
    p.status as payment_status,
    p.created_at as payment_date,
    posts.id as post_id,
    posts.work,
    posts.post_type,
    posts.photo_url,
    posts.employee_photo,
    posts.status as post_status
FROM public.payments p
LEFT JOIN public.posts ON p.post_id = posts.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Show sample unlock request records with post data
SELECT 
    u.id as unlock_id,
    u.post_id,
    u.status as unlock_status,
    u.created_at as unlock_date,
    posts.id as post_id,
    posts.work,
    posts.post_type,
    posts.status as post_status
FROM public.contact_unlock_requests u
LEFT JOIN public.posts ON u.post_id = posts.id
ORDER BY u.created_at DESC
LIMIT 5;

-- Check if there are any posts at all
SELECT 
    'Posts Check' as info,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN post_type = 'employee' THEN 1 END) as employee_posts,
    COUNT(CASE WHEN post_type = 'employer' THEN 1 END) as employer_posts
FROM public.posts;

-- Check if employee_photo column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'employee_photo';
