-- Basic storage bucket creation (no policy changes)
-- Run this in your production Supabase SQL Editor

-- Just create the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs', 
    'payment-proofs', 
    false, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'post-photos', 
    'post-photos', 
    true, -- Public bucket for post photos
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Check if buckets exist now
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
ORDER BY id;

-- Check existing storage objects (if any)
SELECT bucket_id, name, created_at, metadata
FROM storage.objects 
ORDER BY bucket_id, created_at DESC
LIMIT 5;
