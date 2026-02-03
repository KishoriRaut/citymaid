-- ============================================================================
-- Contact Unlock Requests Table
-- ============================================================================
-- Run this script in your Supabase SQL Editor
-- This creates the contact_unlock_requests table that was missing
-- ============================================================================

-- Create contact_unlock_requests table
CREATE TABLE IF NOT EXISTS public.contact_unlock_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visitor_id TEXT,
    user_name TEXT,
    user_phone TEXT,
    user_email TEXT,
    contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'email', 'both')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
    payment_proof TEXT,
    transaction_id TEXT,
    amount INTEGER DEFAULT 3000,
    payment_method TEXT CHECK (payment_method IN ('qr', 'esewa', 'bank', 'khalti')),
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_user_id ON public.contact_unlock_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_status ON public.contact_unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_created_at ON public.contact_unlock_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for idempotency)
DROP POLICY IF EXISTS "Public can insert contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can read own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can read all contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can update contact unlock requests" ON public.contact_unlock_requests;

-- Policy: Public can insert contact unlock requests
CREATE POLICY "Public can insert contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (true);

-- Policy: Users can read their own contact unlock requests
CREATE POLICY "Users can read own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        auth.uid()::text = visitor_id::text OR
        auth.uid()::text = user_id::text OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admins can read all contact unlock requests
CREATE POLICY "Admins can read all contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admins can update contact unlock requests
CREATE POLICY "Admins can update contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create trigger for automatic updated_at
CREATE TRIGGER update_contact_unlock_requests_updated_at
    BEFORE UPDATE ON public.contact_unlock_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.contact_unlock_requests TO anon;
GRANT ALL ON public.contact_unlock_requests TO authenticated;

-- ============================================================================
-- TABLE CREATED SUCCESSFULLY
-- ============================================================================
