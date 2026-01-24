-- ============================================================================
-- Remove Supabase Auth Dependency from Contact Unlock System
-- ============================================================================
-- This script converts contact_unlock_requests from user_id based to visitor_id based
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Check if contact_unlock_requests table exists and has data
DO $$
DECLARE
    table_exists BOOLEAN;
    has_user_id_column BOOLEAN;
    has_data BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_unlock_requests'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Table contact_unlock_requests does not exist. Creating it with visitor_id column.';
        
        -- Create table with visitor_id instead of user_id
        CREATE TABLE IF NOT EXISTS public.contact_unlock_requests (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
            visitor_id TEXT NOT NULL, -- Changed from user_id to visitor_id
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
            payment_proof TEXT, -- URL to payment proof file in storage
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            
            -- Ensure one pending/paid request per visitor per post
            UNIQUE(post_id, visitor_id) WHERE status IN ('pending', 'paid')
        );
    ELSE
        -- Check if user_id column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'contact_unlock_requests'
            AND column_name = 'user_id'
        ) INTO has_user_id_column;
        
        -- Check if table has data
        SELECT EXISTS (SELECT 1 FROM public.contact_unlock_requests LIMIT 1) INTO has_data;
        
        IF has_user_id_column THEN
            RAISE NOTICE 'Migrating from user_id to visitor_id...';
            
            -- Add visitor_id column first
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'contact_unlock_requests'
                AND column_name = 'visitor_id'
            ) THEN
                ALTER TABLE public.contact_unlock_requests ADD COLUMN visitor_id TEXT;
            END IF;
            
            -- Migrate data: set visitor_id to a UUID for existing records
            UPDATE public.contact_unlock_requests 
            SET visitor_id = gen_random_uuid()::TEXT 
            WHERE visitor_id IS NULL;
            
            -- Make visitor_id NOT NULL after migration
            ALTER TABLE public.contact_unlock_requests ALTER COLUMN visitor_id SET NOT NULL;
            
            -- Drop the foreign key constraint if it exists
            DO $$
            DECLARE
                constraint_name TEXT;
            BEGIN
                SELECT conname INTO constraint_name
                FROM pg_constraint
                WHERE conrelid = 'public.contact_unlock_requests'::regclass
                AND confrelid = 'auth.users'::regclass;
                
                IF constraint_name IS NOT NULL THEN
                    EXECUTE 'ALTER TABLE public.contact_unlock_requests DROP CONSTRAINT ' || constraint_name;
                    RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
                END IF;
            END $$;
            
            -- Drop user_id column
            ALTER TABLE public.contact_unlock_requests DROP COLUMN user_id;
            
            -- Update unique constraint
            ALTER TABLE public.contact_unlock_requests DROP CONSTRAINT IF EXISTS contact_unlock_requests_post_id_user_id_key;
            ALTER TABLE public.contact_unlock_requests 
            ADD CONSTRAINT contact_unlock_requests_post_id_visitor_id_key 
            UNIQUE(post_id, visitor_id) WHERE status IN ('pending', 'paid');
            
            RAISE NOTICE 'Migration completed: user_id -> visitor_id';
        ELSE
            RAISE NOTICE 'Table already uses visitor_id, no migration needed';
            
            -- Ensure visitor_id is NOT NULL
            ALTER TABLE public.contact_unlock_requests ALTER COLUMN visitor_id SET NOT NULL;
        END IF;
    END IF;
END $$;

-- 2. Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_status ON public.contact_unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_created_at ON public.contact_unlock_requests(created_at);

-- 3. Enable RLS if not already enabled
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing RLS policies (clean slate)
DROP POLICY IF EXISTS "Users can view own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can insert own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can update own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can view all contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can update all contact unlock requests" ON public.contact_unlock_requests;

-- 5. Create new RLS policies (visitor-based, no auth dependency)

-- Policy: Public can insert contact unlock requests (no auth required)
CREATE POLICY "Public can insert contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (true);

-- Policy: Public can view their own requests by visitor_id
CREATE POLICY "Public can view own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (
        -- This will be enforced by application logic (visitor_id matching)
        -- For now, allow public to see all (admin will filter by visitor_id in app)
        true
    );

-- Policy: Public can update their own requests by visitor_id
CREATE POLICY "Public can update own contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (
        -- This will be enforced by application logic (visitor_id matching)
        true
    );

-- Policy: Service role (admin) has full access
CREATE POLICY "Service role has full access to contact unlock requests" ON public.contact_unlock_requests
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.contact_unlock_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.contact_unlock_requests TO authenticated;
GRANT ALL ON public.contact_unlock_requests TO service_role;

-- 7. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contact_unlock_requests'
ORDER BY ordinal_position;

-- 8. Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contact_unlock_requests';
