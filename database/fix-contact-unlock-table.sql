-- ============================================================================
-- Fix Contact Unlock Requests Table - Add Missing Columns
-- ============================================================================
-- Run this in your PRODUCTION Supabase SQL Editor
-- This adds all the missing columns to the existing table
-- ============================================================================

-- Add all missing columns to the existing table
ALTER TABLE public.contact_unlock_requests 
ADD COLUMN IF NOT EXISTS post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visitor_id TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'phone' CHECK (contact_preference IN ('phone', 'email', 'both')),
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS payment_proof TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 3000,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('qr', 'esewa', 'bank', 'khalti')),
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_user_id ON public.contact_unlock_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_status ON public.contact_unlock_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_unlock_requests_created_at ON public.contact_unlock_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- Verify all columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contact_unlock_requests'
ORDER BY ordinal_position;
