-- Check RLS policies for payment-receipts bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND (
    qual LIKE '%payment-receipts%' OR 
    with_check LIKE '%payment-receipts%'
);

-- Also check storage.buckets RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'buckets';
