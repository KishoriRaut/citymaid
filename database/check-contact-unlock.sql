-- Check contact_unlock_requests for payment data
-- Run this in Supabase SQL Editor

SELECT 
    COUNT(*) as total_unlock_requests,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as with_payment_proof,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_status,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_status
FROM contact_unlock_requests;

-- Get sample records with payment proof
SELECT 
    id,
    post_id,
    status,
    LEFT(payment_proof, 50) as payment_proof_preview,
    created_at
FROM contact_unlock_requests 
WHERE payment_proof IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;
