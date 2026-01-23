-- ============================================================================
-- Security Fixes for CityMaid Contact System
-- ============================================================================
-- Fixes RLS policies and payment-unlock consistency
-- ============================================================================

-- 1. Drop permissive RLS policy on contact_unlocks
DROP POLICY IF EXISTS "Allow all access to contact_unlocks" ON public.contact_unlocks;

-- 2. Create proper RLS policies for contact_unlocks
CREATE POLICY "Users can view own contact unlocks" ON public.contact_unlocks
    FOR SELECT USING (
        auth.uid() = viewer_user_id
    );

CREATE POLICY "Admins can view all contact unlocks" ON public.contact_unlocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.email()
        )
    );

CREATE POLICY "System can insert contact unlocks" ON public.contact_unlocks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.email()
        )
    );

-- 3. Create atomic payment approval function
CREATE OR REPLACE FUNCTION public.approve_payment_and_unlock(
    payment_id_param UUID
)
RETURNS TABLE (
    payment_id UUID,
    post_id UUID,
    unlock_created BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    payment_record RECORD;
    user_id_to_unlock UUID;
    unlock_existing BOOLEAN;
BEGIN
    -- Get payment details
    SELECT p.post_id, p.visitor_id INTO payment_record
    FROM public.payments p
    WHERE p.id = payment_id_param
    AND p.status = 'pending';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT payment_id_param, NULL::UUID, FALSE, 'Payment not found or not pending'::TEXT;
        RETURN;
    END IF;
    
    -- Start transaction
    BEGIN
        -- Update payment status
        UPDATE public.payments 
        SET status = 'approved', updated_at = now()
        WHERE id = payment_id_param;
        
        -- Determine user ID for unlock (emergency mode - authenticated users only)
        -- Skip visitor_id payments until full migration
        IF payment_record.visitor_id IS NOT NULL THEN
            -- Visitor payment - not supported in emergency mode
            user_id_to_unlock := NULL;
        ELSE
            -- Get authenticated user from session context
            user_id_to_unlock := auth.uid();
        END IF;
        
        -- Create unlock record if we have a valid user ID
        unlock_existing := FALSE;
        IF user_id_to_unlock IS NOT NULL THEN
            -- Check if unlock already exists
            SELECT EXISTS(
                SELECT 1 FROM public.contact_unlocks
                WHERE post_id = payment_record.post_id
                AND viewer_user_id = user_id_to_unlock
            ) INTO unlock_existing;
            
            IF NOT unlock_existing THEN
                INSERT INTO public.contact_unlocks (
                    post_id, 
                    viewer_user_id, 
                    payment_verified, 
                    payment_method, 
                    payment_amount,
                    created_at
                ) VALUES (
                    payment_record.post_id,
                    user_id_to_unlock,
                    true,
                    'approved_payment',
                    50.00, -- Default amount
                    now()
                );
            END IF;
        END IF;
        
        -- Return success
        RETURN QUERY 
        SELECT payment_id_param, payment_record.post_id, 
               (user_id_to_unlock IS NOT NULL), NULL::TEXT;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback handled automatically
            RETURN QUERY SELECT payment_id_param, NULL::UUID, FALSE, SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions for the new function
GRANT EXECUTE ON FUNCTION public.approve_payment_and_unlock TO authenticated;

-- 5. Audit existing RLS on other tables
DO $$
DECLARE
    posts_rls_enabled BOOLEAN;
    payments_rls_enabled BOOLEAN;
BEGIN
    -- Check if RLS is enabled on posts
    SELECT relrowsecurity INTO posts_rls_enabled
    FROM pg_class 
    WHERE relname = 'posts';
    
    -- Check if RLS is enabled on payments  
    SELECT relrowsecurity INTO payments_rls_enabled
    FROM pg_class 
    WHERE relname = 'payments';
    
    RAISE NOTICE 'RLS Status - Posts: %, Payments: %', posts_rls_enabled, payments_rls_enabled;
    
    -- Enable RLS if not already enabled
    IF NOT posts_rls_enabled THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on posts table';
    END IF;
    
    IF NOT payments_rls_enabled THEN
        ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on payments table';
    END IF;
END $$;

-- 6. Add basic RLS policies for posts (if missing)
CREATE POLICY IF NOT EXISTS "Public can view approved posts" ON public.posts
    FOR SELECT USING (status = 'approved');

CREATE POLICY IF NOT EXISTS "Admins full access to posts" ON public.posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.email()
        )
    );

-- 7. Add basic RLS policies for payments (if missing)
CREATE POLICY IF NOT EXISTS "Admins full access to payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.email()
        )
    );

-- 8. Success message
DO $$
BEGIN
    RAISE NOTICE 'Security fixes completed successfully!';
    RAISE NOTICE 'contact_unlocks RLS policies updated';
    RAISE NOTICE 'Atomic payment approval function created';
    RAISE NOTICE 'RLS enabled on posts and payments tables';
END $$;
