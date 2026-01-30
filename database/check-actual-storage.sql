-- Check where payment receipts are actually stored
-- Run this in Supabase SQL Editor

-- Check all objects in storage to see where receipts are located
SELECT 
    bucket_id,
    name,
    created_at,
    updated_at
FROM storage.objects 
WHERE name LIKE '%payment_proof%' OR name LIKE '%receipt%'
ORDER BY created_at DESC
LIMIT 10;

-- Also check if there are any objects at all
SELECT 
    bucket_id,
    COUNT(*) as object_count
FROM storage.objects 
GROUP BY bucket_id;
