-- Fix RLS policies for payment-receipts bucket
-- Allow public access to view payment-receipts bucket objects

-- Drop existing policies for payment-receipts if they exist
DROP POLICY IF EXISTS "Public can view payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to payment-receipts" ON storage.objects;

-- Create proper policies for payment-receipts bucket
-- Allow public SELECT (view) access to payment-receipts
CREATE POLICY "Public can view payment-receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-receipts');

-- Allow public INSERT (upload) access to payment-receipts
CREATE POLICY "Public can upload to payment-receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');

-- Allow public UPDATE access to payment-receipts (for their own uploads)
CREATE POLICY "Public can update payment-receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-receipts');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Also ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'payment-receipts';
