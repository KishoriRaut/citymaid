-- Check the structure of contact_unlock_requests table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_unlock_requests' 
ORDER BY ordinal_position;

-- Check if there are any unlock requests
SELECT id, post_id, status, created_at 
FROM contact_unlock_requests 
LIMIT 10;

-- Check if there are any null IDs
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
    COUNT(CASE WHEN post_id IS NULL THEN 1 END) as null_post_ids,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests
FROM contact_unlock_requests;
