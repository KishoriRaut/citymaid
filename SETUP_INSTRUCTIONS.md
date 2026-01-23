# Minimal Supabase Email Authentication Setup

## 📁 Files Created

### 1. `lib/supabase-client.ts` - Singleton Supabase Client
```typescript
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Singleton Supabase client for browser
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabaseClient = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
})();
```

### 2. `components/auth/SimpleEmailLogin.tsx` - Email Login Component
- Email input and OTP button
- Success message: "Check your email for the login link"
- Error message: "Error sending OTP. Check Supabase email provider."
- Clears browser storage on mount to avoid multiple instances

### 3. `app/auth/callback/page.tsx` - Auth Callback Handler
- Handles magic link redirects
- Redirects to `/dashboard` on success
- Shows error messages on failure

### 4. `app/login/page.tsx` - Login Page
- Uses the SimpleEmailLogin component

## 🔧 Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://jjnibbkhubafesjqjohm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Supabase Dashboard Configuration

### 1. Enable Email Provider
1. Go to your Supabase project: https://jjnibbkhubafesjqjohm.supabase.co
2. **Authentication** → **Settings** → **Email**
3. **Toggle "Enable Email provider" to ON** ✅
4. **Leave SMTP fields blank** (uses Supabase's built-in email)

### 2. Add Redirect URLs
1. Still in **Authentication** → **Settings**
2. Scroll to **Redirect URLs** section
3. Add these URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

### 3. Set Site URL
1. In **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000`

### 4. Save Settings
Click **Save** at the bottom of the page

## 🧪 Testing Instructions

### 1. Clear Browser Storage
Before testing, clear browser storage to avoid multiple Supabase client instances:

**Option A: Browser DevTools**
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Clear all items starting with `supabase.auth.`
4. Go to Session Storage and clear the same

**Option B: Console**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Email Authentication
1. Go to http://localhost:3000/login
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email (and spam folder)
5. Click the magic link
6. Should redirect to `/dashboard`

## 🎯 Key Features

✅ **Singleton Pattern**: Only one Supabase client instance  
✅ **Session Persistence**: `persistSession: true`  
✅ **Auto Refresh**: `autoRefreshToken: true`  
✅ **Storage Cleanup**: Clears browser storage on mount  
✅ **Simple Error Handling**: Clear error messages  
✅ **No External SMTP**: Uses Supabase's built-in email  

## 🚨 Common Issues & Solutions

### Issue: "Error sending OTP. Check Supabase email provider."
**Solution**: Enable email provider in Supabase dashboard (see configuration above)

### Issue: Multiple GoTrueClient instances warning
**Solution**: The component automatically clears storage on mount

### Issue: Magic link not working
**Solution**: Ensure redirect URLs are configured correctly in Supabase dashboard

### Issue: Session not persisting
**Solution**: Verify `persistSession: true` is set in client configuration

## 🎉 Success Criteria

✅ Email authentication works without external SMTP  
✅ Magic links redirect correctly  
✅ Sessions persist across browser sessions  
✅ No multiple GoTrueClient warnings  
✅ Clean error handling  
✅ Minimal code footprint  

Your minimal Supabase email authentication is now ready! 🚀
