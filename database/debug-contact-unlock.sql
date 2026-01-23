-- ============================================================================
-- Debug Contact Unlock System
-- ============================================================================
-- Run this to debug why contacts aren't showing after payment approval
-- ============================================================================

-- 1. Check if contact_unlocks table exists and has data
SELECT 'contact_unlocks table exists' as status, COUNT(*) as record_count 
FROM public.contact_unlocks;

-- 2. Show all contact unlock records
SELECT 
    id,
    post_id,
    viewer_user_id,
    visitor_id,
    payment_verified,
    payment_method,
    created_at
FROM public.contact_unlocks
ORDER BY created_at DESC;

-- 3. Check if the RPC function exists
SELECT 'get_public_posts_with_masked_contacts function exists' as status
FROM pg_proc 
WHERE proname = 'get_public_posts_with_masked_contacts';

-- 4. Test the can_view_contact function with a sample post
-- Replace 'your-post-id' and 'your-user-id' with actual values
SELECT 
    can_view_contact('your-post-id'::UUID, 'your-user-id'::UUID) as can_view,
    'Test with actual IDs' as note;

-- 5. Check posts table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check if user is in users table (admin check)
SELECT 
    email,
    'User exists in users table (admin)' as status
FROM public.users 
WHERE email = 'your-email@example.com'; -- Replace with actual email

-- 7. Test phone masking function
SELECT 
    mask_phone_number('9841234567') as masked_phone,
    mask_phone_number('9801234567') as masked_phone2;

-- 8. Check recent payments and their status
SELECT 
    p.id,
    p.post_id,
    p.visitor_id,
    p.status,
    p.method,
    p.amount,
    p.created_at,
    cu.id as unlock_id,
    cu.viewer_user_id,
    cu.payment_verified as unlock_verified
FROM public.payments p
LEFT JOIN public.contact_unlocks cu ON p.post_id = cu.post_id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC
LIMIT 10;

-- Debug instructions
DO $$
BEGIN
    RAISE NOTICE '=== DEBUG INSTRUCTIONS ===';
    RAISE NOTICE '1. Replace placeholder IDs in the queries above with actual values';
    RAISE NOTICE '2. Check if unlock records are being created after payment approval';
    RAISE NOTICE '3. Verify the user_id matches between unlock records and session';
    RAISE NOTICE '4. Test the can_view_contact function with actual post and user IDs';
    RAISE NOTICE '5. Check browser console for any error messages';
    RAISE NOTICE '==========================';
END $$;
