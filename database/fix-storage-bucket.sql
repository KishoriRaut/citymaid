-- Fix storage bucket for payment receipts (handles existing policies)
-- Run this in Supabase SQL Editor

-- Step 1: Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own payment receipts" ON storage.objects;

-- Step 3: Create fresh policies for the bucket
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

-- Step 4: Grant necessary permissions (if not already granted)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END
$$;

GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Step 5: Verify bucket creation and policies
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    p.name as policy_name,
    p.cmd as policy_action
FROM storage.buckets b
LEFT JOIN storage.policies p ON b.id = p.bucket_id
WHERE b.id = 'payment-receipts';
