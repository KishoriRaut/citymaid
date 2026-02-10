-- Create missing storage buckets for production
-- Run this in your production Supabase SQL Editor

-- Create payment-proofs bucket for receipt uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs', 
    'payment-proofs', 
    false, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create post-photos bucket for post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'post-photos', 
    'post-photos', 
    true, -- Public bucket for post photos
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for payment-proofs bucket (private - only admin can access)
CREATE POLICY "Admins can view payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can update payment proofs" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete payment proofs" ON storage.objects
FOR DELETE USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Create policies for post-photos bucket (public access)
CREATE POLICY "Public can view post photos" ON storage.objects
FOR SELECT USING (bucket_id = 'post-photos');

CREATE POLICY "Anyone can upload post photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'post-photos');

CREATE POLICY "Anyone can update post photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'post-photos');

CREATE POLICY "Anyone can delete post photos" ON storage.objects
FOR DELETE USING (bucket_id = 'post-photos');

-- Verify buckets were created
SELECT id, name, public FROM storage.buckets ORDER BY id;
