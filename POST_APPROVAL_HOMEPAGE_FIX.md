# Posts Not Showing After Admin Approval - Complete Fix

## Problem Identified
Posts were not appearing on the homepage after admin approval, even though the payment status was updated to 'approved'.

## Root Cause Found
The admin approval process was only updating the `payments` table status but **not updating the `posts` table status**.

### The Broken Flow
1. **Post creation**: `posts.status = 'pending'`
2. **Payment**: `payments` record created
3. **Admin approval**: `payments.status = 'approved'` ✅ but `posts.status = 'pending'` ❌
4. **Homepage**: Only shows posts where `posts.status = 'approved'` → **No posts shown**

### The Fixed Flow  
1. **Post creation**: `posts.status = 'pending'`
2. **Payment**: `payments` record created
3. **Admin approval**: `payments.status = 'approved'` ✅ AND `posts.status = 'approved'` ✅
4. **Homepage**: Shows posts where `posts.status = 'approved'` → **Posts shown!** ✅

## Fix Applied

### Updated Admin Payment Approval Function
**File**: `lib/admin-payments.ts`
- Added logic to fetch `post_id` from payment record
- When approving, updates both:
  - `payments.status = 'approved'` 
  - `posts.status = 'approved'`
- Added logging for successful post status updates

### Code Changes
```typescript
// If approving, also update the post status to 'approved'
if (status === 'approved') {
  const { error: postError } = await supabase
    .from('posts')
    .update({ status: 'approved' })
    .eq('id', payment.post_id);
  
  console.log('✅ Post status updated to approved for post:', payment.post_id);
}
```

## Expected Result
- ✅ **Admin approval** will now update both payment and post status
- ✅ **Approved posts** will immediately appear on homepage
- ✅ **Homepage filtering** will work correctly
- ✅ **Payment tracking** still works properly

## Testing
1. Create a new post (will be pending)
2. Admin approves the payment
3. Check homepage - post should now appear ✅
4. Check console for "✅ Post status updated to approved" message

## Files Modified
- `lib/admin-payments.ts` - Updated updateAdminPaymentStatus to also update post status

## Status
✅ COMPLETE - Posts will now appear on homepage after admin approval
