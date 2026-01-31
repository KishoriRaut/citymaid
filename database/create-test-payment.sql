-- ============================================================================
-- Quick Test - Create Sample Payment Data
-- ============================================================================
-- Run this in Supabase SQL Editor to create test data
-- ============================================================================

-- First, check if we have any posts
SELECT 'Existing Posts' as info, COUNT(*) as count FROM public.posts;

-- If no posts exist, create a test post
INSERT INTO public.posts (
  post_type, work, time, place, salary, contact, status
) VALUES 
(
  'employee',
  'Test Work',
  'Full Time',
  'Test Location',
  'Test Salary',
  'Test Contact',
  'approved'
) ON CONFLICT DO NOTHING;

-- Get the post ID
SELECT 'Created Post' as info, id, work FROM public.posts WHERE work = 'Test Work' LIMIT 1;

-- Create a test payment record
INSERT INTO public.payments (
  post_id, visitor_id, amount, method, status
) VALUES 
(
  (SELECT id FROM public.posts WHERE work = 'Test Work' LIMIT 1),
  'test_visitor_123',
  299,
  'qr',
  'pending'
) ON CONFLICT DO NOTHING;

-- Check if payment was created
SELECT 'Created Payment' as info, COUNT(*) as count FROM public.payments;

-- Show all payments with post data
SELECT 
    p.id as payment_id,
    p.status as payment_status,
    posts.work,
    posts.post_type,
    posts.photo_url,
    posts.employee_photo
FROM public.payments p
LEFT JOIN public.posts ON p.post_id = posts.id
ORDER BY p.created_at DESC;
