# Database Setup Guide

## Prerequisites

1. Install required dependencies:
```bash
npm install @supabase/supabase-js bcryptjs
npm install --save-dev @types/bcryptjs
```

## Supabase Setup

1. **Create a Supabase project** at https://supabase.com

2. **Run the SQL schema**:
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Copy and paste the contents of `database/supabase-setup.sql`
   - Click **Run** to execute

3. **Get your Supabase credentials**:
   - Go to **Settings** → **API**
   - Copy your **Project URL**
   - Copy your **service_role key** (keep this secret!)

4. **Create environment file**:
   - Create a file named `.env.local` in the `citymaid` directory
   - Add the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   Example:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## Testing

1. Go to `/signup` and create an account
2. Check your Supabase dashboard → **Table Editor** → **users** to see the new user
3. Go to `/login` and sign in with the credentials

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- Passwords are automatically hashed using bcrypt before storage
- Never log or return passwords in API responses
