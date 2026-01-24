-- ============================================================================
-- Remove Supabase Auth Dependency from Contact Unlock System
-- ============================================================================
-- This script converts contact_unlock_requests from user_id based to visitor_id based
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create table without complex unique constraint
CREATE TABLE IF NOT EXISTS public.contact_unlock_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL, -- Changed from user_id to visitor_id
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
    payment_proof TEXT, -- URL to payment proof file in storage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Drop ALL existing RLS policies first (before touching columns)
DROP POLICY IF EXISTS "Users can view own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can insert own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users can update own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can view all contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Admins can update all contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Users own requests" ON public.contact_unlock_requests; -- Additional policy that might exist

-- Step 3: Add visitor_id column if table exists but doesn't have it
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_unlock_requests'
        AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_unlock_requests'
        AND column_name = 'visitor_id'
    ) THEN
        ALTER TABLE public.contact_unlock_requests ADD COLUMN visitor_id TEXT;
        RAISE NOTICE 'Added visitor_id column';
    END IF;
END $$;

-- Step 4: Migrate data from user_id to visitor_id if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_unlock_requests'
        AND column_name = 'user_id'
    ) THEN
        -- Migrate existing data
        UPDATE public.contact_unlock_requests 
        SET visitor_id = COALESCE(visitor_id, gen_random_uuid()::TEXT)
        WHERE visitor_id IS NULL;
        
        -- Make visitor_id NOT NULL
        ALTER TABLE public.contact_unlock_requests ALTER COLUMN visitor_id SET NOT NULL;
        
        RAISE NOTICE 'Migrated data from user_id to visitor_id';
    END IF;
END $$;

-- Step 5: Drop foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = 'contact_unlock_requests'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Drop the constraint (we don't need the exact name)
        ALTER TABLE public.contact_unlock_requests DROP CONSTRAINT IF EXISTS contact_unlock_requests_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint';
    END IF;
END $$;

-- Step 6: Drop user_id column if it exists (policies already dropped)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_unlock_requests'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.contact_unlock_requests DROP COLUMN user_id;
        RAISE NOTICE 'Dropped user_id column';
    END IF;
END $$;

-- Step 7: Drop existing unique constraints
ALTER TABLE public.contact_unlock_requests DROP CONSTRAINT IF EXISTS contact_unlock_requests_post_id_user_id_key;
ALTER TABLE public.contact_unlock_requests DROP CONSTRAINT IF EXISTS contact_unlock_requests_post_id_visitor_id_key;

-- Step 8: Create partial unique index instead of constraint (PostgreSQL way)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_unlock_requests_unique_pending 
ON public.contact_unlock_requests(post_id, visitor_id) 
WHERE status IN ('pending', 'paid');

-- Step 9: Add other indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_status ON public.contact_unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_created_at ON public.contact_unlock_requests(created_at);

-- Step 10: Enable RLS
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- Step 11: Create new RLS policies (visitor-based, no auth dependency)

-- Policy: Public can insert contact unlock requests (no auth required)
CREATE POLICY "Public can insert contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (true);

-- Policy: Public can view their own requests by visitor_id
CREATE POLICY "Public can view own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT USING (true);

-- Policy: Public can update their own requests by visitor_id
CREATE POLICY "Public can update own contact unlock requests" ON public.contact_unlock_requests
    FOR UPDATE USING (true);

-- Policy: Service role (admin) has full access
CREATE POLICY "Service role has full access to contact unlock requests" ON public.contact_unlock_requests
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Step 12: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.contact_unlock_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.contact_unlock_requests TO authenticated;
GRANT ALL ON public.contact_unlock_requests TO service_role;

-- Step 13: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contact_unlock_requests'
ORDER BY ordinal_position;

-- Step 14: Show RLS policies
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

-- Step 15: Show indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'contact_unlock_requests' 
AND schemaname = 'public';
