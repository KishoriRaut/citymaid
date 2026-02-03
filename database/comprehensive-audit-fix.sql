-- Comprehensive fix for all audit tables
-- Run this in your production Supabase SQL Editor

-- Fix payment_audit_log table with all possible columns
ALTER TABLE public.payment_audit_log 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id),
ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS old_status TEXT,
ADD COLUMN IF NOT EXISTS new_status TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'update',
ADD COLUMN IF NOT EXISTS old_values JSON,
ADD COLUMN IF NOT EXISTS new_values JSON,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix audit_logs table
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS table_name TEXT,
ADD COLUMN IF NOT EXISTS record_id UUID,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'insert',
ADD COLUMN IF NOT EXISTS old_values JSON,
ADD COLUMN IF NOT EXISTS new_values JSON,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix security_logs table
ALTER TABLE public.security_logs 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'access',
ADD COLUMN IF NOT EXISTS resource TEXT,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS details JSON,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) UNIQUE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferences JSON,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verify payment_audit_log has all columns it needs
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payment_audit_log'
ORDER BY ordinal_position;
