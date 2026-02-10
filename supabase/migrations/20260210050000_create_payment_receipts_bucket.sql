-- Create payment-receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, owner, avif_autodetection, file_size_limit, allowed_mime_types, public)
VALUES (
  'payment-receipts',
  'payment-receipts', 
  '00000000-0000-0000-0000-000000000000', -- service_role placeholder
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  true -- Make bucket public
) ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Allow public access to upload to payment-receipts bucket
CREATE POLICY "Public can upload to payment-receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');

-- Allow public access to view payment-receipts
CREATE POLICY "Public can view payment-receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-receipts');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own payment-receipts" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own payment-receipts" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
