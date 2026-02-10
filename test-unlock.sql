-- Test creating and finding unlock requests
-- First, let's see what's in the table now
SELECT id, post_id, visitor_id, status, created_at 
FROM contact_unlock_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if there are any NULL IDs
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as valid_ids
FROM contact_unlock_requests;

-- Try to create a test request
INSERT INTO contact_unlock_requests (post_id, visitor_id, status)
VALUES ('test-post-123', 'visitor_test_123', 'pending')
RETURNING id, post_id, visitor_id, status;
