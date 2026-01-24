-- ============================================================================
-- Storage Bucket for Payment Proofs
-- ============================================================================

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for payment-proofs bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'authenticated'
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own payment proofs" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'authenticated'
);

-- Allow admins to read all payment proofs
CREATE POLICY "Admins can read all payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);

-- Allow admins to delete payment proofs
CREATE POLICY "Admins can delete payment proofs" ON storage.objects
FOR DELETE USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);
