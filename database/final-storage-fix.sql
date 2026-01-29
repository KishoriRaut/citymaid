-- Quick fix: Create bucket and upload placeholder photos
-- Run this in Supabase SQL Editor, then manually upload placeholder images

-- 1. Create the bucket (this should work now)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-photos', 
  'post-photos', 
  true, 
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies
DROP POLICY IF EXISTS "Public can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read photos" ON storage.objects;
CREATE POLICY "Public can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-photos');
CREATE POLICY "Public can read photos" ON storage.objects FOR SELECT USING (bucket_id = 'post-photos');

-- 3. Create placeholder file entries (you'll need to upload actual files via Supabase Dashboard)
INSERT INTO storage.objects (bucket_id, name, metadata, created_at)
VALUES 
  ('post-photos', '1706520000-employee-1.jpg', '{"size": 102400, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', '1706520100-employee-2.jpg', '{"size": 153600, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', '1706520200-employee-3.jpg', '{"size": 204800, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', '1706520300-employee-4.jpg', '{"size": 128000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', '1706520400-employee-5.jpg', '{"size": 180000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', '1706520500-employee-6.jpg', '{"size": 160000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', 'receipt-1769701270-b2cdc251-12db-434e-aa41-311aa9afefde.jpg', '{"size": 80000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', 'receipt-1769701270-ed60c66c-b84c-4153-a8b1-9383ee192812.jpg', '{"size": 75000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', 'receipt-1769701270-fd196590-438b-4626-b253-1aeaa0f268ab.jpg', '{"size": 90000, "mimetype": "image/jpeg"}', NOW()),
  ('post-photos', 'receipt-1769701270-be03ed47-b7e6-4126-aaf5-105974d71d1b.jpg', '{"size": 85000, "mimetype": "image/jpeg"}', NOW())
ON CONFLICT (bucket_id, name) DO NOTHING;

-- 4. Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'post-photos';

-- 5. Verify files exist
SELECT bucket_id, name, created_at FROM storage.objects WHERE bucket_id = 'post-photos';
