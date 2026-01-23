# Minimal Supabase Email Authentication Setup

## 🚀 Overview
A minimal working Supabase email authentication setup for Next.js 13+ (app directory) that works in development without Resend or SMTP.

## 📁 Files Created/Modified

### 1. Client-Side Supabase Client (`lib/supabase-client.ts`)
```typescript
// Singleton client-side Supabase instance with correct auth settings
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### 2. Server-Side Supabase Client (`lib/supabase.ts`)
```typescript
// Server-side Supabase client for server actions only
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

### 3. Email Login Component (`components/auth/EmailLogin.tsx`)
- Minimal OTP/magic link login component
- Clears browser storage on mount to prevent multiple GoTrueClient issues
- Listens to auth state changes
- Proper error handling

### 4. Auth Callback Page (`app/auth/callback/page.tsx`)
- Handles magic link redirects
- Processes authentication and redirects to dashboard

### 5. Storage Cleanup Utility (`lib/auth-cleanup.ts`)
- Clears Supabase browser storage to prevent multiple client issues
- Functions: `clearSupabaseStorage()` and `clearAllBrowserStorage()`

## 🔧 Setup Instructions

### Step 1: Environment Variables
Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Clear Browser Storage
Before testing, clear browser storage to prevent multiple GoTrueClient issues:

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

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Configure Supabase Dashboard
1. Go to your Supabase project dashboard
2. **Authentication** → **Settings** → **Email**
3. **Toggle "Enable Email provider" to ON** ✅
4. **Leave SMTP fields blank** (uses Supabase's built-in email)
5. **Add Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`
6. **Set Site URL**: `http://localhost:3000`
7. **Save** settings

## 🧪 Testing

### 1. Start the App
```bash
npm run dev
```
Navigate to: http://localhost:3000/login

### 2. Test Email Login
1. Enter your email address
2. Click "Send Magic Link"
3. Check your email (and spam folder)
4. Click the magic link
5. Should redirect to `/dashboard`

### 3. Verify Session Persistence
- Close and reopen browser
- Should still be logged in
- Session persists due to `persistSession: true`

## 🎯 Key Features

### ✅ Singleton Pattern
- Only one Supabase client instance
- Prevents "Multiple GoTrueClient instances" warning

### ✅ Proper Auth Settings
- `persistSession: true` - Session persists across browser sessions
- `autoRefreshToken: true` - Automatically refreshes tokens
- `detectSessionInUrl: true` - Detects auth in URL for magic links

### ✅ Storage Cleanup
- Clears existing storage on component mount
- Prevents conflicts from previous sessions

### ✅ Error Handling
- Specific error messages for common issues
- Clear guidance for configuration problems

### ✅ Auth State Management
- Real-time auth state changes
- Automatic UI updates on sign in/out

## 🚨 Common Issues & Solutions

### Issue: "Multiple GoTrueClient instances detected"
**Solution**: The component automatically clears storage on mount. If it persists, manually clear browser storage.

### Issue: 500 Error when sending magic link
**Solution**: Enable email provider in Supabase dashboard (see Step 4 above).

### Issue: Magic link not working
**Solution**: Ensure redirect URLs are configured correctly in Supabase dashboard.

### Issue: Session not persisting
**Solution**: Verify `persistSession: true` is set in client configuration.

## 📝 Usage Examples

### Basic Login Page
```tsx
import EmailLogin from "@/components/auth/EmailLogin";

export default function LoginPage() {
  return <EmailLogin redirectTo="/dashboard" />;
}
```

### Protected Route
```tsx
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

export default function ProtectedPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
  }, []);

  if (!user) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome {user.email}</div>;
}
```

## 🎉 Success Criteria

✅ Email authentication works without external SMTP  
✅ Magic links redirect correctly  
✅ Sessions persist across browser sessions  
✅ No multiple GoTrueClient warnings  
✅ Clean error handling  
✅ Minimal code footprint  

Your setup is now ready for development! 🚀
