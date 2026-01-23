# 🚨 CRITICAL: Fix Supabase Email 500 Error

## The Problem
```
Failed to load resource: the server responded with a status of 500 ()
```
This happens because **Email Provider is NOT ENABLED** in your Supabase project.

## IMMEDIATE FIX REQUIRED

### Step 1: Go to Your Supabase Dashboard
👉 **https://jjnibbkhubafesjqjohm.supabase.co**

### Step 2: Enable Email Provider
1. Click **Authentication** (left sidebar)
2. Click **Settings** tab
3. Click **Email** sub-tab
4. **Toggle "Enable Email provider" to ON** ✅
5. **Leave ALL SMTP fields blank** (uses Supabase's built-in email)

### Step 3: Configure Redirect URLs
1. Still in **Authentication** → **Settings**
2. Scroll to **Redirect URLs** section
3. Add these URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

### Step 4: Set Site URL
1. In **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000`

### Step 5: SAVE SETTINGS
Click **Save** at the bottom of the page!

## Why This Fixes the 500 Error
- **Before**: Email provider disabled → Supabase can't send emails → 500 error
- **After**: Email provider enabled → Supabase uses built-in email → Magic links work ✅

## Test After Configuration
1. Go to http://localhost:3000/login
2. Enter your email
3. Click "Send Login Link"
4. Should see "Login link sent!" message

## Verification
The 500 error will disappear immediately after you enable the email provider in the dashboard.

## Development vs Production
- **Development**: Supabase's built-in email works (no SMTP needed)
- **Production**: You'll configure SMTP later (Resend, SendGrid, etc.)

---
**⚠️ IMPORTANT**: This is a dashboard configuration issue, NOT a code issue. Your code is perfect!
