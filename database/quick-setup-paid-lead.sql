-- ============================================================================
-- Quick Setup for Paid Lead Flow
-- ============================================================================

-- Create contact_unlock_requests table
CREATE TABLE IF NOT EXISTS public.contact_unlock_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
    payment_proof TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(post_id, user_id) WHERE status IN ('pending', 'paid')
);

-- Enable RLS
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Admins full access" ON public.contact_unlock_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

CREATE POLICY "Users own requests" ON public.contact_unlock_requests
    FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can read own payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Admins can read all payment proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);
