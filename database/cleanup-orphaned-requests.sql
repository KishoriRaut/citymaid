-- Identify and clean up orphaned contact unlock requests
-- These are requests that were created but users couldn't complete payment due to parameter mismatch

-- Check how many requests are stuck in pending status without payment proof
SELECT 
    COUNT(*) as total_pending_requests,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24_hours,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Show recent pending requests without payment proof
SELECT 
    id,
    visitor_id,
    status,
    payment_proof,
    created_at,
    updated_at,
    AGE(NOW(), created_at) as age
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- Option 1: Delete very old pending requests (older than 7 days) that were likely abandoned
-- Uncomment this if you want to clean up old abandoned requests
/*
DELETE FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';
*/

-- Option 2: Update old requests to 'rejected' status instead of deleting
-- Uncomment this if you prefer to reject rather than delete
/*
UPDATE contact_unlock_requests 
SET status = 'rejected',
    updated_at = NOW()
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';
*/

-- Verify cleanup results
SELECT 
    COUNT(*) as remaining_pending,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_pending
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;
