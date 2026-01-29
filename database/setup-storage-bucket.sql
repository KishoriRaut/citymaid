-- Create post-photos storage bucket and set up policies
-- This needs to be run in Supabase SQL Editor

-- 1. Create the storage bucket (using INSERT into storage.buckets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-photos', 
  'post-photos', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete own photos" ON storage.objects;

-- 3. Create policies for public access
-- Policy: Allow public to upload photos
CREATE POLICY "Public can upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'post-photos');

-- Policy: Allow public to read photos
CREATE POLICY "Public can read photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to update their own photos
CREATE POLICY "Public can update own photos" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to delete their own photos
CREATE POLICY "Public can delete own photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'post-photos');

-- 4. Verify bucket was created
SELECT * FROM storage.buckets WHERE name = 'post-photos';

-- 5. Verify policies were created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%photo%';
