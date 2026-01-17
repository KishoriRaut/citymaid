# Supabase Database Setup

This directory contains SQL schemas for setting up the users table in Supabase.

## Files

- `supabase-schema.sql` - Basic users table schema
- `supabase-setup.sql` - Complete setup with RLS policies (recommended)

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

## Row Level Security (RLS)

The schema includes RLS policies:

- **Service role** - Can manage all users (for API routes)
- **Authenticated users** - Can view and update their own data
- **Public signup** - Allows anyone to create an account (can be restricted)

## Security Notes

⚠️ **Important**: 
- Always hash passwords before storing (use `bcrypt` or `argon2`)
- The password field stores hashed passwords, never plain text
- RLS policies protect user data at the database level

## Example Queries

### Insert a new user (from your API)
```sql
INSERT INTO public.users (email, password) 
VALUES ('user@example.com', '$2b$10$hashedpasswordhere')
RETURNING id, email, created_at;
```

### Find user by email
```sql
SELECT * FROM public.users 
WHERE email = 'user@example.com';
```

### Update user password
```sql
UPDATE public.users 
SET password = 'newhashedpassword' 
WHERE id = 'uuid-here';
```

### Get user by ID
```sql
SELECT id, email, created_at 
FROM public.users 
WHERE id = 'uuid-here';
```

## Connecting from Next.js

You'll need to install the Supabase client:

```bash
npm install @supabase/supabase-js
```

Then create a Supabase client and use it in your API routes.
