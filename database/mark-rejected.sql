-- Mark old abandoned requests as rejected instead of deleting
-- Execute this in Supabase SQL Editor if you prefer to keep audit trail

-- Step 1: See what will be updated
SELECT 
    COUNT(*) as requests_to_reject,
    MIN(created_at) as oldest_request,
    MAX(created_at) as newest_request
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

-- Step 2: Update old requests to 'rejected' status
UPDATE contact_unlock_requests 
SET status = 'rejected',
    updated_at = NOW()
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

-- Step 3: Verify results
SELECT 
    status,
    COUNT(*) as count
FROM contact_unlock_requests 
GROUP BY status
ORDER BY count DESC;
