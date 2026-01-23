# Fix Supabase Email Authentication 500 Error

## Problem Identified
The error `Database error saving new user` (500 status) occurs because the **Email provider is not enabled** in your Supabase project.

## Root Cause
Your app is trying to send magic links/OTP emails, but Supabase doesn't have the email provider configured, so it fails when trying to create the user record.

## Step-by-Step Fix

### 1. Go to Your Supabase Dashboard
Navigate to: https://jjnibbkhubafesjqjohm.supabase.co

### 2. Enable Email Provider
1. Click **Authentication** in the left sidebar
2. Go to **Settings** → **Email** tab
3. **Toggle "Enable Email provider" to ON** ✅
4. **Leave all SMTP fields blank** (this uses Supabase's built-in email for development)

### 3. Configure Redirect URLs
1. Still in **Authentication** → **Settings**
2. Scroll to **Redirect URLs** section
3. Add these URLs (one per line):
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/**
   ```

### 4. Set Site URL
1. In **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3001`

### 5. Save Settings
Click **Save** at the bottom of the page

### 6. Test the Fix
After saving, try the login again:
1. Go to http://localhost:3001/login
2. Enter your email
3. Check your email for the magic link

## Why This Works
- **Before**: Email provider disabled → Supabase can't send emails → 500 error
- **After**: Email provider enabled → Supabase uses built-in email → Magic links work

## Development vs Production
- **Development**: Supabase's built-in email works (no SMTP needed)
- **Production**: You'll configure SMTP later (Resend, SendGrid, etc.)

## Verification
Once configured, you should see:
- ✅ No more 500 errors
- ✅ "Login link sent!" message
- ✅ Email arrives in your inbox
- ✅ Clicking link logs you in

## Troubleshooting
If still getting 500 errors:
1. Double-check email provider is enabled
2. Verify redirect URLs include your port (3001)
3. Check Site URL is correct
4. Try refreshing the Supabase dashboard page
