-- ============================================================================
-- Contact Unlock Requests System for CityMaid Marketplace
-- ============================================================================
-- This creates a paid-lead flow system for contact unlock requests
-- Users create requests, upload payment proof, and admins approve them
-- ============================================================================

-- 1. Create contact_unlock_requests table
CREATE TABLE IF NOT EXISTS public.contact_unlock_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null initially
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
    payment_proof TEXT, -- URL to payment proof file in storage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one pending/paid request per user per post
    UNIQUE(post_id, user_id) WHERE status IN ('pending', 'paid')
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_user_id ON public.contact_unlock_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_status ON public.contact_unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_created_at ON public.contact_unlock_requests(created_at);

-- 3. Enable RLS on contact_unlock_requests table
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for contact_unlock_requests
-- Users can only see their own request records
CREATE POLICY "Users can view own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Users can only insert their own request records
CREATE POLICY "Users can insert own contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Users can only update their own request records
CREATE POLICY "Users can update own contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Admins can view all requests
CREATE POLICY "Admins can view all contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Admins can update all requests
CREATE POLICY "Admins can update all contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- 5. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_unlock_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger to automatically update updated_at
CREATE TRIGGER update_contact_unlock_requests_updated_at
    BEFORE UPDATE ON public.contact_unlock_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_unlock_requests_updated_at();

-- 7. Grant permissions
GRANT ALL ON public.contact_unlock_requests TO authenticated;
GRANT SELECT ON public.contact_unlock_requests TO anon;
