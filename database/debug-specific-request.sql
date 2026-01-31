-- Debug specific contact unlock request payment proof
-- Run this in Supabase SQL Editor to check the specific request

-- Find recent contact unlock requests with phone numbers
SELECT 
    id,
    post_id,
    visitor_id,
    status,
    payment_proof,
    user_name,
    user_phone,
    user_email,
    contact_preference,
    created_at,
    updated_at
FROM contact_unlock_requests 
WHERE user_phone IS NOT NULL 
   OR user_email IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are any requests with payment_proof data
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as with_payment_proof,
    COUNT(CASE WHEN payment_proof IS NULL THEN 1 END) as without_payment_proof
FROM contact_unlock_requests;

-- Check the specific phone number from the error (9843277736)
SELECT 
    id,
    post_id,
    visitor_id,
    status,
    payment_proof,
    user_name,
    user_phone,
    user_email,
    contact_preference,
    created_at
FROM contact_unlock_requests 
WHERE user_phone = '9843277736'
ORDER BY created_at DESC;
