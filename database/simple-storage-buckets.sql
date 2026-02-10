-- Simple storage bucket setup without complex policies
-- Run this in your production Supabase SQL Editor

-- Drop existing policies (start fresh)
DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update post photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete post photos" ON storage.objects;

-- Create buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-photos', 'post-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "Allow all operations on payment-proofs" ON storage.objects
FOR ALL USING (bucket_id = 'payment-proofs');

CREATE POLICY "Allow all operations on post-photos" ON storage.objects
FOR ALL USING (bucket_id = 'post-photos');

-- Verify setup
SELECT id, name, public FROM storage.buckets ORDER BY id;
