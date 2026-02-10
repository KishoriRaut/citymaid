-- ============================================================================
-- PROPER STORAGE FIX FOR SUPABASE
-- ============================================================================
-- This creates proper storage policies that work with Supabase
-- ============================================================================

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Anyone can upload to post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payment-proofs" ON storage.objects;

-- Create proper storage policies for Supabase
CREATE POLICY "Allow public uploads to post-photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'post-photos')
    TO public;

CREATE POLICY "Allow public view post-photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-photos')
    TO public;

CREATE POLICY "Allow public uploads to payment-proofs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-proofs')
    TO public;

CREATE POLICY "Allow public view payment-proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-proofs')
    TO public;

-- Grant service role full access to storage
CREATE POLICY "Service role full access" ON storage.objects
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role')
    TO service_role;

SELECT 'Proper storage fix completed successfully' as final_status;
