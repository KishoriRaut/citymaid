-- Aggressive cleanup of orphaned contact unlock requests
-- Since the parameter mismatch was fixed recently, we should clean up older abandoned requests

-- Step 1: See what will be deleted (requests older than 2 days)
SELECT 
    COUNT(*) as requests_to_delete_2days,
    MIN(created_at) as oldest_request,
    MAX(created_at) as newest_request_to_delete
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '2 days';

-- Step 2: Delete requests older than 2 days (Jan 28 and earlier)
DELETE FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '2 days';

-- Step 3: Also delete very recent requests that are clearly abandoned (same visitor with multiple requests)
-- First identify visitors with multiple pending requests
WITH duplicate_visitors AS (
  SELECT visitor_id, COUNT(*) as request_count
  FROM contact_unlock_requests 
  WHERE status = 'pending' 
    AND payment_proof IS NULL
    AND created_at >= NOW() - INTERVAL '2 days'
  GROUP BY visitor_id
  HAVING COUNT(*) > 1
)
-- Keep only the newest request for each visitor, delete the rest
DELETE FROM contact_unlock_requests 
WHERE id NOT IN (
  SELECT DISTINCT ON (visitor_id) id
  FROM contact_unlock_requests 
  WHERE status = 'pending' 
    AND payment_proof IS NULL
    AND created_at >= NOW() - INTERVAL '2 days'
    AND visitor_id IN (SELECT visitor_id FROM duplicate_visitors)
  ORDER BY visitor_id, created_at DESC
)
AND status = 'pending' 
  AND payment_proof IS NULL
  AND created_at >= NOW() - INTERVAL '2 days'
  AND visitor_id IN (SELECT visitor_id FROM duplicate_visitors);

-- Step 4: Verify cleanup results
SELECT 
    COUNT(*) as remaining_pending,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24_hours,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '2 days' THEN 1 END) as last_2_days
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Step 5: Show remaining requests (should be much fewer now)
SELECT 
    id,
    visitor_id,
    status,
    created_at,
    AGE(NOW(), created_at) as age
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
ORDER BY created_at DESC
LIMIT 20;
