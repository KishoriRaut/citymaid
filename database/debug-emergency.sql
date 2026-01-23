-- ============================================================================
-- Debug Contact Unlock System (Emergency Mode)
-- ============================================================================
-- This works with the emergency schema (no visitor_id column)
-- Run this to debug why contacts aren't showing after payment approval
-- ============================================================================

-- 1. Check if contact_unlocks table exists and has data
SELECT 'contact_unlocks table exists' as status, COUNT(*) as record_count 
FROM public.contact_unlocks;

-- 2. Show all contact unlock records (emergency schema - no visitor_id)
SELECT 
    id,
    post_id,
    viewer_user_id,
    payment_verified,
    payment_method,
    payment_amount,
    created_at
FROM public.contact_unlocks
ORDER BY created_at DESC;

-- 3. Check if the RPC function exists
SELECT 'get_public_posts_with_masked_contacts function exists' as status
FROM pg_proc 
WHERE proname = 'get_public_posts_with_masked_contacts';

-- 4. Check recent payments and their unlock status
SELECT 
    p.id as payment_id,
    p.post_id,
    p.visitor_id,
    p.status as payment_status,
    p.method,
    p.amount,
    p.created_at as payment_created,
    cu.id as unlock_id,
    cu.viewer_user_id,
    cu.payment_verified as unlock_verified,
    cu.created_at as unlock_created
FROM public.payments p
LEFT JOIN public.contact_unlocks cu ON p.post_id = cu.post_id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Test the can_view_contact function with sample data
-- You'll need to replace these with actual IDs from your database
DO $$
BEGIN
    -- Get a sample post and user for testing
    DECLARE sample_post_id UUID;
    DECLARE sample_user_id UUID;
    
    -- Get first approved post
    SELECT id INTO sample_post_id 
    FROM public.posts 
    WHERE status = 'approved' 
    LIMIT 1;
    
    -- Get first user from contact_unlocks
    SELECT viewer_user_id INTO sample_user_id 
    FROM public.contact_unlocks 
    LIMIT 1;
    
    IF sample_post_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing can_view_contact with post_id: %, user_id: %', sample_post_id, sample_user_id;
        RAISE NOTICE 'Result: %', public.can_view_contact(sample_post_id, sample_user_id);
    ELSE
        RAISE NOTICE 'No sample data found for testing';
    END IF;
END $$;

-- 6. Check posts table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Test phone masking function
SELECT 
    mask_phone_number('9841234567') as masked_phone,
    mask_phone_number('9801234567') as masked_phone2,
    mask_phone_number(NULL) as null_phone;

-- 8. Check if user is admin (for admin bypass)
SELECT 
    email,
    'User exists in users table (admin)' as status
FROM public.users 
LIMIT 5;

-- 9. Show recent approved posts
SELECT 
    id,
    work,
    contact,
    status,
    created_at
FROM public.posts 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 5;

-- Debug instructions
DO $$
BEGIN
    RAISE NOTICE '=== EMERGENCY DEBUG INSTRUCTIONS ===';
    RAISE NOTICE '1. Check if unlock records exist in query #2';
    RAISE NOTICE '2. Verify payments are approved in query #4';
    RAISE NOTICE '3. Check if unlock records are created for approved payments';
    RAISE NOTICE '4. Test can_view_contact function in query #5';
    RAISE NOTICE '5. Verify user authentication in browser';
    RAISE NOTICE '6. Check browser console for errors';
    RAISE NOTICE '======================================';
END $$;
