# Admin Security Implementation

## Overview

This document outlines the security measures implemented for the admin dashboard in the CityMaid application.

## Security Features

### 1. Authentication

- **Email-based Admin Access**: Only users with emails ending in `@admin.com` (or configured domains) can access admin features
- **Server-side Validation**: All admin routes are protected by middleware that verifies admin status
- **Client-side Checks**: Admin button is conditionally rendered based on user authentication

### 2. Route Protection

#### Middleware Protection
- All `/admin/*` routes are protected by middleware
- Non-admin users are redirected to `/unauthorized`
- Middleware checks Supabase session and email domain

#### Layout Protection
- Admin layout includes client-side authentication check
- Automatic redirect to unauthorized page if not admin
- Loading states during authentication checks

### 3. API Security

#### Admin API Wrapper
- `withAdminAuth` wrapper function for admin-only API routes
- Server-side verification using `requireAdmin()`
- Consistent error responses for unauthorized access

#### Example API Route
```typescript
import { withAdminAuth } from '@/lib/api/admin'

export async function GET() {
  return withAdminAuth(async () => {
    // Admin-only logic here
    return NextResponse.json({ data: 'Admin data' })
  })
}
```

### 4. Components

#### AdminButton Component
- Client-side component that checks admin status
- Uses both client and server verification
- Only renders for authenticated admin users
- Includes loading states

#### Unauthorized Page
- Dedicated page for unauthorized access attempts
- Clear messaging about access restrictions
- Option to return to home page

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Admin email patterns (comma-separated)
ADMIN_EMAILS=@admin.com,@yourdomain.com
NEXT_PUBLIC_ADMIN_EMAIL_PATTERN=@admin.com,@yourdomain.com
```

### Supabase Setup

1. Ensure Supabase Auth is properly configured
2. Create admin users with emails ending in the configured domain
3. Test authentication flow

## Testing

### Testing Admin Access

1. **Admin User**:
   - Log in with an admin email (e.g., `admin@citymaid.com`)
   - The admin button should appear in the header
   - Access to `/admin` routes should work
   - API calls to `/api/admin/*` should succeed

2. **Non-Admin User**:
   - Log in with a regular user email
   - The admin button should not appear
   - Direct access to `/admin` should redirect to `/unauthorized`
   - API calls to `/api/admin/*` should return 403

3. **Unauthenticated User**:
   - No admin button visible
   - Access to `/admin` should redirect to `/unauthorized`
   - API calls to `/api/admin/*` should return 403

### Security Testing

1. **Client-side Bypass**:
   - Try to manually navigate to `/admin` as non-admin
   - Should be blocked by middleware

2. **API Security**:
   - Make direct API calls to admin endpoints
   - Should return 403 for non-admin users

3. **Session Management**:
   - Test logout functionality
   - Verify session expiration handling

## Best Practices

### Do's
- Always use server-side validation for admin operations
- Implement proper error handling for unauthorized access
- Use the `withAdminAuth` wrapper for admin API routes
- Log unauthorized access attempts for monitoring

### Don'ts
- Rely solely on client-side checks for security
- Hardcode admin credentials in the code
- Skip authentication checks for "development" convenience
- Expose sensitive admin data in client-side code

## Monitoring

### Audit Logging
Consider implementing audit logging for admin actions:

```sql
-- Example audit log entry
INSERT INTO audit_logs (
  user_id,
  action,
  table_name,
  record_id,
  old_values,
  new_values,
  ip_address,
  user_agent,
  created_at
) VALUES (
  auth.uid(),
  'admin_action',
  'posts',
  post_id,
  old_data,
  new_data,
  current_setting('request.headers', true)::json->>'x-forwarded-for',
  current_setting('request.headers', true)::json->>'user-agent',
  NOW()
);
```

### Security Headers
The application includes security headers via middleware:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Troubleshooting

### Common Issues

1. **Admin Button Not Showing**:
   - Check if user is authenticated
   - Verify email domain matches configuration
   - Check browser console for errors

2. **Middleware Redirect Loop**:
   - Ensure Supabase client is properly configured
   - Check environment variables
   - Verify authentication flow

3. **API 403 Errors**:
   - Check if user session is valid
   - Verify admin email pattern
   - Check API route implementation

## Future Enhancements

1. **Role-based Access Control**: Implement more granular permissions
2. **Multi-factor Authentication**: Add 2FA for admin accounts
3. **Session Timeout**: Implement automatic logout for inactivity
4. **IP Whitelisting**: Restrict admin access to specific IPs
5. **Audit Dashboard**: Create comprehensive audit log viewer
