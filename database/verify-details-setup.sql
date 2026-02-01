-- Verification: Check details column setup
-- Purpose: Verify that the details column is properly configured

-- Check details column properties
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';

-- Check constraint exists
SELECT conname, contype
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass AND conname = 'details_not_empty';

-- Show sample data to verify updates
SELECT 
    id, 
    post_type, 
    LEFT(details, 50) as details_preview,
    length(details) as details_length,
    CASE 
        WHEN length(details) >= 10 THEN '✅ Valid'
        ELSE '❌ Too short'
    END as validation_status
FROM posts 
ORDER BY created_at DESC
LIMIT 10;

-- Count posts by validation status
SELECT 
    CASE 
        WHEN length(details) >= 10 THEN 'Valid (10+ chars)'
        ELSE 'Invalid (< 10 chars)'
    END as validation_group,
    COUNT(*) as post_count
FROM posts 
GROUP BY 
    CASE 
        WHEN length(details) >= 10 THEN 'Valid (10+ chars)'
        ELSE 'Invalid (< 10 chars)'
    END
ORDER BY validation_group;
