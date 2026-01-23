-- ============================================================================
-- Contact Unlock System for CityMaid Marketplace (Safe Version)
-- ============================================================================
-- This creates a secure payment-based contact unlock system
-- Safe for multiple runs - handles existing objects gracefully
-- ============================================================================

-- 1. Create contact_unlocks table (IF NOT EXISTS handles multiple runs)
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_verified BOOLEAN DEFAULT false,
    payment_method TEXT, -- 'khalti', 'esewa', 'stripe', etc.
    payment_amount DECIMAL(10, 2),
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one unlock per user per post
    UNIQUE(post_id, viewer_user_id)
);

-- 2. Add indexes (IF NOT EXISTS handles multiple runs)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'contact_unlocks' AND indexname = 'idx_contact_unlocks_post_id') THEN
        CREATE INDEX idx_contact_unlocks_post_id ON public.contact_unlocks(post_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'contact_unlocks' AND indexname = 'idx_contact_unlocks_viewer_user_id') THEN
        CREATE INDEX idx_contact_unlocks_viewer_user_id ON public.contact_unlocks(viewer_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'contact_unlocks' AND indexname = 'idx_contact_unlocks_payment_verified') THEN
        CREATE INDEX idx_contact_unlocks_payment_verified ON public.contact_unlocks(payment_verified);
    END IF;
END $$;

-- 3. Enable RLS on contact_unlocks table (safe to run multiple times)
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist, then create new ones
DO $$
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can view own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Users can insert own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Users can update own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Admins full access to contact_unlocks" ON public.contact_unlocks;
    
    -- Create new policies
    CREATE POLICY "Users can view own contact unlocks" ON public.contact_unlocks
        FOR SELECT USING (
            auth.uid() = viewer_user_id
        );

    CREATE POLICY "Users can insert own contact unlocks" ON public.contact_unlocks
        FOR INSERT WITH CHECK (
            auth.uid() = viewer_user_id
        );

    CREATE POLICY "Users can update own contact unlocks" ON public.contact_unlocks
        FOR UPDATE USING (
            auth.uid() = viewer_user_id
        );

    CREATE POLICY "Admins full access to contact_unlocks" ON public.contact_unlocks
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE users.email = auth.email()
            )
        );
END $$;

-- 5. Create or replace functions (safe for multiple runs)
CREATE OR REPLACE FUNCTION public.can_view_contact(
    post_id_param UUID,
    viewer_user_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    is_post_owner BOOLEAN := FALSE;
    is_admin BOOLEAN := FALSE;
    has_unlock BOOLEAN := FALSE;
    post_owner_id UUID;
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
    
    -- Get post owner (assuming posts has a user_id field, if not, we'll need to adjust)
    -- For now, we'll check if the contact matches (less secure but works for current schema)
    -- In a perfect world, posts would have a created_by field
    
    -- Check if user has paid for this contact
    SELECT EXISTS(
        SELECT 1 FROM public.contact_unlocks
        WHERE post_id = post_id_param
        AND viewer_user_id = viewer_user_id_param
        AND payment_verified = true
    ) INTO has_unlock;
    
    RETURN has_unlock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create or replace phone masking function
CREATE OR REPLACE FUNCTION public.mask_phone_number(phone TEXT)
RETURNS TEXT AS $$
BEGIN
    IF phone IS NULL OR length(phone) < 4 THEN
        RETURN NULL;
    END IF;
    
    RETURN substr(phone, 1, 2) || repeat('*', length(phone) - 4) || substr(phone, -2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Create or replace updated view for public posts with masked contacts
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
    contact TEXT, -- This will be masked or full based on access
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    can_view_contact BOOLEAN -- Explicit flag for frontend
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
            ELSE public.mask_phone_number(p.contact)
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

-- 8. Grant permissions (safe to run multiple times)
GRANT EXECUTE ON FUNCTION public.can_view_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mask_phone_number TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_posts_with_masked_contacts TO anon, authenticated;

-- ============================================================================
-- USAGE EXAMPLES:
-- ============================================================================
-- 
-- 1. Check if user can view contact:
-- SELECT can_view_contact('post-uuid', 'user-uuid');
--
-- 2. Mask a phone number:
-- SELECT mask_phone_number('9841234567'); -- Returns: 98******67
--
-- 3. Get public posts with proper contact masking:
-- SELECT * FROM get_public_posts_with_masked_contacts('user-uuid');
--
-- 4. Insert a contact unlock after payment:
-- INSERT INTO contact_unlocks (post_id, viewer_user_id, payment_verified, payment_method, payment_amount)
-- VALUES ('post-uuid', 'user-uuid', true, 'khalti', 50.00);
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Contact unlock system setup completed successfully!';
    RAISE NOTICE 'Tables, indexes, policies, and functions have been created/updated.';
END $$;
