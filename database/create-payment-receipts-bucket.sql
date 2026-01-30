-- Create storage bucket for payment receipts
-- Run this in Supabase SQL Editor

-- Step 1: Create the storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create policies for the bucket
-- Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access to payment receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-receipts');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload payment receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded files
CREATE POLICY "Allow users to update their own payment receipts"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Allow users to delete their own payment receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 3: Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Step 4: Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'payment-receipts';
