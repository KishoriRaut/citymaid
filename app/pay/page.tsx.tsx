-- ============================================================================
-- Update Contact Unlock Requests Table for Visitor Support
-- ============================================================================
-- This migration updates the contact_unlock_requests table to support visitor IDs
-- and transaction IDs for the simplified unlock flow
-- ============================================================================

-- 1. Add visitor_id column (if not exists)
ALTER TABLE public.contact_unlock_requests 
ADD COLUMN IF NOT EXISTS visitor_id TEXT;

-- 2. Add transaction_id column (if not exists)
ALTER TABLE public.contact_unlock_requests 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- 3. Update existing records to use visitor_id from user_id for migration
-- Only run if user_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_unlock_requests' 
        AND column_name = 'user_id'
    ) THEN
        UPDATE public.contact_unlock_requests 
        SET visitor_id = user_id::TEXT 
        WHERE visitor_id IS NULL AND user_id IS NOT NULL;
    END IF;
END $$;

-- 4. Create index for visitor_id
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_visitor_id ON public.contact_unlock_requests(visitor_id);

-- 5. Create index for transaction_id
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_transaction_id ON public.contact_unlock_requests(transaction_id);

-- 6. Update unique constraint to work with visitor_id
-- Drop existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'contact_unlock_requests' 
        AND constraint_name = 'contact_unlock_requests_post_id_user_id_key'
    ) THEN
        ALTER TABLE public.contact_unlock_requests 
        DROP CONSTRAINT contact_unlock_requests_post_id_user_id_key;
    END IF;
END $$;

-- Add new constraint that works with visitor_id
ALTER TABLE public.contact_unlock_requests 
ADD CONSTRAINT contact_unlock_requests_unique_post_visitor 
EXCLUDE (post_id WITH =, visitor_id WITH =) WHERE (status IN ('pending', 'paid') AND visitor_id IS NOT NULL);

-- 7. Update RLS policies to support visitor_id
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can insert own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can update own contact unlock requests" ON public.contact_unlock_requests;

-- Create new policies that support visitor_id
CREATE POLICY "Users can view own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        visitor_id IS NOT NULL
    );

CREATE POLICY "Users can insert own contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (
        visitor_id IS NOT NULL
    );

CREATE POLICY "Users can update own contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (
        visitor_id IS NOT NULL
    );

-- 8. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contact_unlock_requests'
ORDER BY ordinal_position;
