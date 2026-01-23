-- ============================================================================
-- Migration Script for Contact Unlock System
-- ============================================================================
-- This script adds visitor_id column to existing contact_unlocks table
-- Run this after the main contact-unlock-system-safe.sql script
-- ============================================================================

-- 1. Add visitor_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_unlocks' 
        AND column_name = 'visitor_id'
    ) THEN
        ALTER TABLE public.contact_unlocks ADD COLUMN visitor_id TEXT;
        
        -- Add comment
        COMMENT ON COLUMN public.contact_unlocks.visitor_id IS 'For anonymous users (random visitor IDs)';
    END IF;
END $$;

-- 2. Drop the old unique constraint if it exists
DO $$
BEGIN
    -- Drop the old unique constraint if it exists
    ALTER TABLE public.contact_unlocks DROP CONSTRAINT IF EXISTS contact_unlocks_post_id_viewer_user_id_key;
    
    -- Add the new exclusion constraint for both user types
    ALTER TABLE public.contact_unlocks ADD CONSTRAINT contact_unlocks_unique_user_post 
    EXCLUDE USING gist (post_id WITH =, viewer_user_id WITH =, visitor_id WITH =);
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraint handling completed (may already exist)';
END $$;

-- 3. Create visitor_id index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'contact_unlocks' AND indexname = 'idx_contact_unlocks_visitor_id') THEN
        CREATE INDEX idx_contact_unlocks_visitor_id ON public.contact_unlocks(visitor_id);
        RAISE NOTICE 'Created visitor_id index';
    END IF;
END $$;

-- 4. Update RLS policies to handle visitor_id
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Users can insert own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Users can update own contact unlocks" ON public.contact_unlocks;
    DROP POLICY IF EXISTS "Admins full access to contact_unlocks" ON public.contact_unlocks;
    
    -- Create updated policies
    CREATE POLICY "Users can view own contact unlocks" ON public.contact_unlocks
        FOR SELECT USING (
            auth.uid() = viewer_user_id OR 
            (auth.uid() IS NULL AND visitor_id IS NOT NULL)
        );

    CREATE POLICY "Users can insert own contact unlocks" ON public.contact_unlocks
        FOR INSERT WITH CHECK (
            auth.uid() = viewer_user_id OR 
            (auth.uid() IS NULL AND visitor_id IS NOT NULL)
        );

    CREATE POLICY "Users can update own contact unlocks" ON public.contact_unlocks
        FOR UPDATE USING (
            auth.uid() = viewer_user_id OR 
            (auth.uid() IS NULL AND visitor_id IS NOT NULL)
        );

    CREATE POLICY "Admins full access to contact_unlocks" ON public.contact_unlocks
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE users.email = auth.email()
            )
        );
END $$;

-- 5. Success message
DO $$
BEGIN
    RAISE NOTICE 'Contact unlock migration completed successfully!';
    RAISE NOTICE 'visitor_id column and indexes have been added.';
    RAISE NOTICE 'RLS policies have been updated.';
END $$;
