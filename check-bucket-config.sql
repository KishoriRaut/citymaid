-- Check if bucket exists and its configuration
SELECT id, name, owner, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'payment-receipts';

-- Check bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'payment-receipts';
