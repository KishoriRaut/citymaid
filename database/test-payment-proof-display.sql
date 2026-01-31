-- Test query to check payment_proof in contact_unlock_requests
-- Run this in Supabase SQL Editor

SELECT 
  id,
  post_id,
  visitor_id,
  status,
  payment_proof,
  user_name,
  user_phone,
  user_email,
  created_at
FROM contact_unlock_requests 
WHERE payment_proof IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Also check total counts
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as with_payment_proof,
  COUNT(CASE WHEN payment_proof IS NULL THEN 1 END) as without_payment_proof
FROM contact_unlock_requests;
