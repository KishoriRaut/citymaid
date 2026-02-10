-- ============================================================================
-- SIMPLE STORAGE FIX - WORKING VERSION
-- ============================================================================
-- This script creates working storage policies
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can upload to post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payment-proofs" ON storage.objects;

-- Create simple working policies
CREATE POLICY "Public upload post-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-photos') TO public;
CREATE POLICY "Public view post-photos" ON storage.objects FOR SELECT USING (bucket_id = 'post-photos') TO public;
CREATE POLICY "Public upload payment-proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs') TO public;
CREATE POLICY "Public view payment-proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs') TO public;

SELECT 'Simple storage fix completed' as status;
