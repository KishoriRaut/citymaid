-- Clean up orphaned contact unlock requests - Execute this in Supabase SQL Editor

-- Step 1: See what will be deleted (requests older than 7 days)
SELECT 
    COUNT(*) as requests_to_delete,
    MIN(created_at) as oldest_request,
    MAX(created_at) as newest_request
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

-- Step 2: Delete old abandoned requests (older than 7 days)
DELETE FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

-- Step 3: Verify cleanup results
SELECT 
    COUNT(*) as remaining_pending,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_pending,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Step 4: Show remaining recent requests (last 7 days) that might still be active
SELECT 
    id,
    visitor_id,
    status,
    created_at,
    AGE(NOW(), created_at) as age
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
