# CityMaid Database Setup

This directory contains the production-ready SQL schema for the CityMaid marketplace in Supabase.

## Files

- `supabase-setup.sql` - Complete database schema with RLS policies, tables, and security functions

## Quick Start

### 1. Run the SQL Script

1. Open your Supabase project dashboard at https://supabase.com
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `database/supabase-setup.sql` and copy all contents
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)

### 2. Verify Setup

After running the script, verify everything was created:

**Check Tables:**
- Go to **Table Editor** in Supabase dashboard
- You should see: `users`, `posts`, `payments`
- Each table should show a lock icon (🔒) indicating RLS is enabled

**Test the Function:**
Run this in SQL Editor:
```sql
-- This should return empty (no posts yet, or only shows approved posts)
SELECT * FROM get_public_posts();
```

### 3. Test Insert Operations

**Test Post Insert (Public):**
```sql
INSERT INTO posts (post_type, work, "time", place, salary, contact)
VALUES ('employer', 'Need cleaner', '9am-5pm', 'Kathmandu', '5000', '9801234567');
```

**Test Payment Insert (Public):**
```sql
INSERT INTO payments (post_id, visitor_id, method, reference_id)
VALUES (
  (SELECT id FROM posts LIMIT 1),
  'visitor123',
  'esewa',
  'ESEWA123456'
);
```

**Note:** The `time` column is quoted because it's a PostgreSQL reserved word.

## Database Schema

### Tables

#### `users` (Admin-only)
- Admin-only access via service_role
- No public signup
- Used for admin authentication

#### `posts`
- **Columns:**
  - `id` - UUID (auto-generated)
  - `post_type` - 'employer' or 'employee'
  - `work` - Job description
  - `"time"` - Work time (quoted because `time` is reserved)
  - `place` - Location
  - `salary` - Payment amount
  - `contact` - Contact information (protected)
  - `photo_url` - Optional photo
  - `status` - 'pending', 'approved', or 'hidden' (default: 'pending')
  - `created_at` - Timestamp

#### `payments`
- **Columns:**
  - `id` - UUID (auto-generated)
  - `post_id` - References posts(id) with CASCADE delete
  - `visitor_id` - Visitor identifier
  - `amount` - Payment amount (default: 399)
  - `method` - 'qr', 'esewa', or 'bank'
  - `reference_id` - Payment reference
  - `status` - 'pending', 'approved', or 'rejected' (default: 'pending')
  - `created_at` - Timestamp

## Security & RLS Policies

### Public Access Rules

1. **Posts:**
   - ✅ Public can INSERT posts (status must be 'pending')
   - ✅ Public can READ approved posts via `get_public_posts()` function
   - ❌ Public CANNOT directly SELECT from posts table (protects contacts)
   - ✅ Admin (service_role) has full access

2. **Payments:**
   - ✅ Public can INSERT payments (status must be 'pending')
   - ✅ Public can READ their own approved payments
   - ✅ Admin (service_role) has full access

3. **Contact Protection:**
   - Contacts are **never exposed** unless payment is approved
   - Use `get_public_posts()` function to query posts safely
   - Direct table queries are blocked for public users

### Users Table
- ❌ No public access
- ✅ Only service_role (admin) can manage users

## Usage in Application

### Query Posts (Public)

**Using Supabase Client:**
```typescript
// Use the RPC function to get posts with protected contacts
const { data, error } = await supabase.rpc('get_public_posts');
```

**Using SQL:**
```sql
SELECT * FROM get_public_posts();
```

### Insert Post (Public)

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    post_type: 'employer',
    work: 'Need cleaner',
    time: '9am-5pm',
    place: 'Kathmandu',
    salary: '5000',
    contact: '9801234567'
    // status defaults to 'pending'
  });
```

### Insert Payment (Public)

```typescript
const { data, error } = await supabase
  .from('payments')
  .insert({
    post_id: 'uuid-here',
    visitor_id: 'visitor123',
    method: 'esewa',
    reference_id: 'ESEWA123456'
    // status defaults to 'pending'
  });
```

### Admin Operations

Admin operations use the service_role key which bypasses RLS:

```typescript
// Admin can query posts directly
const { data } = await supabaseAdmin
  .from('posts')
  .select('*')
  .eq('status', 'pending');

// Admin can update post status
await supabaseAdmin
  .from('posts')
  .update({ status: 'approved' })
  .eq('id', postId);

// Admin can approve payments
await supabaseAdmin
  .from('payments')
  .update({ status: 'approved' })
  .eq('id', paymentId);
```

## Important Notes

⚠️ **Security:**
- Always use `get_public_posts()` for public post queries
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Contacts are automatically hidden unless payment is approved

⚠️ **Column Naming:**
- The `time` column is quoted (`"time"`) because it's a PostgreSQL reserved word
- When querying, use: `SELECT "time" FROM posts;` or let Supabase client handle it

⚠️ **Cascade Deletion:**
- Deleting a post will automatically delete all associated payments
- This is handled by `ON DELETE CASCADE` in the foreign key

## Troubleshooting

**Error: "relation does not exist"**
- Make sure you ran the SQL script completely
- Check that all tables were created in Table Editor

**Error: "permission denied"**
- Verify RLS is enabled (lock icon on tables)
- Check that you're using the correct Supabase client (anon vs service_role)

**Contacts are visible when they shouldn't be**
- Make sure you're using `get_public_posts()` function, not direct table queries
- Verify payment status is 'approved' before contacts become visible

## Next Steps

After setting up the database:

1. ✅ Update your `.env.local` with Supabase credentials
2. ✅ Update your API routes to use the new schema
3. ✅ Implement admin dashboard for approving posts/payments
4. ✅ Test the contact protection logic
5. ✅ Set up payment verification workflow
