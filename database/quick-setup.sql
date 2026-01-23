-- ============================================================================
-- Quick Setup for Contact Unlock System
-- ============================================================================
-- This creates the minimum required functions to get the app working immediately
-- Run this first, then run the full migration later
-- ============================================================================

-- 1. Create basic contact_unlocks table
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    visitor_id TEXT,
    payment_verified BOOLEAN DEFAULT false,
    payment_method TEXT,
    payment_amount DECIMAL(10, 2),
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_post_id ON public.contact_unlocks(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_viewer_user_id ON public.contact_unlocks(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_visitor_id ON public.contact_unlocks(visitor_id);

-- 3. Enable RLS
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

-- 4. Create basic can_view_contact function
CREATE OR REPLACE FUNCTION public.can_view_contact(
    post_id_param UUID,
    viewer_user_id_param UUID DEFAULT NULL,
    visitor_id_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
    has_unlock BOOLEAN := FALSE;
BEGIN
    -- Check if viewer is admin
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE users.email = COALESCE(auth.email(), '')
    ) INTO is_admin;
    
    -- If admin, return true
    IF is_admin THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has paid for this contact (authenticated user)
    IF viewer_user_id_param IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.contact_unlocks
            WHERE post_id = post_id_param
            AND viewer_user_id = viewer_user_id_param
            AND payment_verified = true
        ) INTO has_unlock;
    END IF;
    
    -- Check if visitor has paid for this contact (anonymous user)
    IF NOT has_unlock AND visitor_id_param IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.contact_unlocks
            WHERE post_id = post_id_param
            AND visitor_id = visitor_id_param
            AND payment_verified = true
        ) INTO has_unlock;
    END IF;
    
    RETURN has_unlock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create basic get_public_posts_with_masked_contacts function
CREATE OR REPLACE FUNCTION public.get_public_posts_with_masked_contacts(
    viewer_user_id_param UUID DEFAULT NULL,
    visitor_id_param TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    can_view_contact BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Show full contact only if user can view it, otherwise mask it
        CASE 
            WHEN public.can_view_contact(p.id, viewer_user_id_param, visitor_id_param) THEN p.contact
            ELSE CASE 
                WHEN p.contact IS NULL OR length(p.contact) < 4 THEN NULL
                ELSE substr(p.contact, 1, 2) || repeat('*', length(p.contact) - 4) || substr(p.contact, -2)
            END
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at,
        public.can_view_contact(p.id, viewer_user_id_param, visitor_id_param) AS can_view_contact
    FROM public.posts p
    WHERE p.status = 'approved'
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.can_view_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_posts_with_masked_contacts TO anon, authenticated;

-- 7. Basic RLS policies
CREATE POLICY "Allow all access to contact_unlocks" ON public.contact_unlocks
    FOR ALL USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Quick setup completed! Contact unlock system is now active.';
    RAISE NOTICE 'The app should work immediately after this script.';
END $$;
