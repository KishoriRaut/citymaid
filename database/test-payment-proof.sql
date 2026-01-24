-- Test script to verify payment proof functionality
-- Run this in Supabase SQL Editor

-- Step 1: Check if the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name IN ('homepage_payment_status', 'payment_proof');

-- Step 2: Check existing posts
SELECT 
    id, 
    status, 
    homepage_payment_status,
    payment_proof,
    created_at
FROM public.posts 
ORDER BY created_at DESC 
LIMIT 3;

-- Step 3: Test update on a specific post (replace with actual post ID)
-- UPDATE public.posts 
-- SET 
--     homepage_payment_status = 'pending',
--     payment_proof = 'test_payment_proof_url'
-- WHERE id = 'YOUR-POST-ID-HERE';

-- Step 4: Verify the update
-- SELECT * FROM public.posts WHERE id = 'YOUR-POST-ID-HERE';
