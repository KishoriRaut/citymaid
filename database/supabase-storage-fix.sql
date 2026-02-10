-- ============================================================================
-- SUPABASE COMPATIBLE STORAGE FIX
-- ============================================================================
-- Uses standard Supabase storage policy syntax
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can upload to post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payment-proofs" ON storage.objects;

-- Create Supabase-compatible storage policies
CREATE POLICY "Allow public uploads to post-photos" ON storage.objects
    FOR INSERT ON storage.objects WITH CHECK (bucket_id = 'post-photos');

CREATE POLICY "Allow public view post-photos" ON storage.objects
    FOR SELECT ON storage.objects USING (bucket_id = 'post-photos');

CREATE POLICY "Allow public uploads to payment-proofs" ON storage.objects
    FOR INSERT ON storage.objects WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Allow public view payment-proofs" ON storage.objects
    FOR SELECT ON storage.objects USING (bucket_id = 'payment-proofs');

SELECT 'Supabase storage fix completed' as status;
