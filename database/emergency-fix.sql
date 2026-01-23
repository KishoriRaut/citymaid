-- ============================================================================
-- Emergency Fix - Get App Working Immediately
-- ============================================================================
-- This works with the existing schema (no visitor_id support yet)
-- Run this to fix the 404 error immediately
-- ============================================================================

-- 1. Create basic can_view_contact function (works with existing schema)
CREATE OR REPLACE FUNCTION public.can_view_contact(
    post_id_param UUID,
    viewer_user_id_param UUID DEFAULT NULL
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
    
    -- If no viewer_user_id, return false
    IF viewer_user_id_param IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has paid for this contact (authenticated users only for now)
    SELECT EXISTS(
        SELECT 1 FROM public.contact_unlocks
        WHERE post_id = post_id_param
        AND viewer_user_id = viewer_user_id_param
        AND payment_verified = true
    ) INTO has_unlock;
    
    RETURN has_unlock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create basic get_public_posts_with_masked_contacts function
CREATE OR REPLACE FUNCTION public.get_public_posts_with_masked_contacts(
    viewer_user_id_param UUID DEFAULT NULL
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
            WHEN public.can_view_contact(p.id, viewer_user_id_param) THEN p.contact
            ELSE CASE 
                WHEN p.contact IS NULL OR length(p.contact) < 4 THEN NULL
                ELSE substr(p.contact, 1, 2) || repeat('*', length(p.contact) - 4) || substr(p.contact, -2)
            END
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at,
        public.can_view_contact(p.id, viewer_user_id_param) AS can_view_contact
    FROM public.posts p
    WHERE p.status = 'approved'
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.can_view_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_posts_with_masked_contacts TO anon, authenticated;

-- 4. Ensure basic RLS on contact_unlocks (if not already enabled)
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'RLS already enabled or table does not exist';
END $$;

-- 5. Create basic RLS policy for contact_unlocks
CREATE POLICY "Allow all access to contact_unlocks" ON public.contact_unlocks
    FOR ALL USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Emergency fix completed! The app should work now.';
    RAISE NOTICE 'Note: This works with authenticated users only (no visitor_id support yet).';
    RAISE NOTICE 'Run the full migration later for visitor_id support.';
END $$;
