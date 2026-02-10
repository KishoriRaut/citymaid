-- ============================================================================
-- BASIC STORAGE FIX - MOST COMPATIBLE VERSION
-- ============================================================================
-- Uses the most basic, universally compatible syntax
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can upload to post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payment-proofs" ON storage.objects;

-- Create the most basic storage policies
CREATE POLICY "Public can upload post-photos" ON storage.objects FOR INSERT TO public;
CREATE POLICY "Public can view post-photos" ON storage.objects FOR SELECT TO public;
CREATE POLICY "Public can upload payment-proofs" ON storage.objects FOR INSERT TO public;
CREATE POLICY "Public can view payment-proofs" ON storage.objects FOR SELECT TO public;

SELECT 'Basic storage fix completed' as status;
