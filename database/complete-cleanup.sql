-- Complete cleanup of ALL pending requests without payment proof
-- Use this if you want to start completely fresh after fixing the parameter mismatch

-- Step 1: See what will be deleted
SELECT 
    COUNT(*) as total_requests_to_delete,
    MIN(created_at) as oldest_request,
    MAX(created_at) as newest_request
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Step 2: Delete ALL pending requests without payment proof
DELETE FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Step 3: Verify complete cleanup
SELECT 
    COUNT(*) as remaining_pending
FROM contact_unlock_requests 
WHERE status = 'pending' 
  AND payment_proof IS NULL;

-- Step 4: Show overall status
SELECT 
    status,
    COUNT(*) as count
FROM contact_unlock_requests 
GROUP BY status
ORDER BY count DESC;
