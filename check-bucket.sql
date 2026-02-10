-- Check bucket policies
SELECT * FROM storage.policies WHERE bucket_name = 'payment-receipts';

-- Check if bucket exists and is public
SELECT * FROM storage.buckets WHERE name = 'payment-receipts';
