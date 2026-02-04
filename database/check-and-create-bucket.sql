-- Check and create payment-proofs bucket
-- Run this in your production Supabase SQL Editor

-- First, check if the bucket exists
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'payment-proofs' OR name = 'payment-proofs';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs', 
    'payment-proofs', 
    false, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
WHERE id = 'payment-proofs' OR name = 'payment-proofs';
