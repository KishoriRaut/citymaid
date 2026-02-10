-- Check if payment-receipts bucket is public and has files
SELECT 
    id, 
    bucket_id, 
    name, 
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'payment-receipts'
ORDER BY created_at DESC
LIMIT 5;

-- Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'payment-receipts';
