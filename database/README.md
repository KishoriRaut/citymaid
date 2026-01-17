# Database Setup

This directory contains the SQL schema for setting up the users table in Supabase.

## Files

- `supabase-setup.sql` - Complete setup script with RLS policies (use this one)

## Quick Start

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute

## Table Structure

The `users` table includes:

- `id` - UUID primary key (auto-generated)
- `email` - VARCHAR(255), unique, required
- `password` - VARCHAR(255), required (should be hashed)
- `created_at` - Timestamp (auto-set)
- `updated_at` - Timestamp (auto-updated)

## Security Notes

⚠️ **Important**: 
- Always hash passwords before storing (use `bcrypt` or `argon2`)
- The password field stores hashed passwords, never plain text
- RLS policies protect user data at the database level
