-- Fix payment_audit_log table - add missing columns
-- Run this in your production Supabase SQL Editor

-- Add missing columns to payment_audit_log table
ALTER TABLE public.payment_audit_log 
ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id),
ADD COLUMN IF NOT EXISTS old_status TEXT,
ADD COLUMN IF NOT EXISTS new_status TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'update';

-- Also fix other audit tables if they have similar issues
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS table_name TEXT,
ADD COLUMN IF NOT EXISTS record_id UUID,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'insert',
ADD COLUMN IF NOT EXISTS old_values JSON,
ADD COLUMN IF NOT EXISTS new_values JSON;

ALTER TABLE public.security_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'access',
ADD COLUMN IF NOT EXISTS resource TEXT,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) UNIQUE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferences JSON;

-- Verify the tables are properly structured
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('payment_audit_log', 'audit_logs', 'security_logs', 'user_profiles')
ORDER BY table_name, ordinal_position;
