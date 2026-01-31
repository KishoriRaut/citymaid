-- Test payment proof data in contact_unlock_requests
-- Run this in Supabase SQL Editor

-- Check if payment_proof column exists and has data
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contact_unlock_requests'
AND column_name = 'payment_proof';

-- Sample recent requests with payment proof info
SELECT 
    id,
    post_id,
    visitor_id,
    status,
    CASE 
        WHEN payment_proof IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as has_payment_proof,
    CASE 
        WHEN payment_proof IS NOT NULL THEN LENGTH(payment_proof)
        ELSE 0
    END as payment_proof_length,
    LEFT(payment_proof, 50) as payment_proof_preview,
    user_name,
    user_phone,
    user_email,
    created_at
FROM contact_unlock_requests 
ORDER BY created_at DESC
LIMIT 10;

-- Count requests with and without payment proof
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as with_payment_proof,
    COUNT(CASE WHEN payment_proof IS NULL THEN 1 END) as without_payment_proof,
    ROUND(
        COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as percentage_with_proof
FROM contact_unlock_requests;

-- Check if payment-proofs bucket exists and has files
-- This will need to be checked via the Supabase dashboard or API
-- But we can check the URLs in the payment_proof column
SELECT 
    COUNT(*) as total_with_urls,
    COUNT(CASE WHEN payment_proof LIKE 'http%' THEN 1 END) as with_full_urls,
    COUNT(CASE WHEN payment_proof LIKE 'payment-proofs/%' THEN 1 END) as with_bucket_urls
FROM contact_unlock_requests 
WHERE payment_proof IS NOT NULL;
