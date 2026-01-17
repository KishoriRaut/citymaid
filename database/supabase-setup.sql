-- Supabase setup script for Siscora app
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything (for API routes)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Allow authenticated users to view their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Policy: Allow authenticated users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Policy: Allow public inserts for signup (or restrict to authenticated only)
-- Option 1: Allow public signup
CREATE POLICY "Allow public signup" ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Option 2: Only allow authenticated users to insert (uncomment if preferred)
-- CREATE POLICY "Authenticated users can insert" ON public.users
--     FOR INSERT
--     WITH CHECK (auth.role() = 'authenticated');
