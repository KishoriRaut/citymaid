-- Check the actual structure of contact_unlock_requests
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contact_unlock_requests'
ORDER BY ordinal_position;
