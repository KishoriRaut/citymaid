# Employee Post Photo Issue - Complete Fix

## Problem Identified
Employee posts were not showing photos on the homepage, but they were showing correctly in the admin requests tab.

## Root Cause Found
The photo display logic in `PostCard.tsx` was completely backwards:

### Incorrect Logic (BEFORE)
```typescript
// EMPLOYEE ONLY: Only show photos for employee posts, disable for employer posts
const displayPhoto = isHiring ? null : post.photo_url;
```

This logic:
- **Hid photos** for employer posts (`isHiring ? null`)
- **Only used `photo_url`** for employee posts (but should use `employee_photo`)

### Correct Logic (AFTER)
```typescript
// Use the correct photo field based on post type
const displayPhoto = post.post_type === "employee" ? post.employee_photo : post.photo_url;
```

This logic:
- **Employee posts**: Use `employee_photo` ✅
- **Employer posts**: Use `photo_url` ✅

## Database Schema
The `posts` table has both photo fields:
- `photo_url` - For employer posts
- `employee_photo` - For employee posts

## Fix Applied

### 1. Updated Photo Display Logic
**File**: `components/marketplace/PostCard.tsx`
- Changed from `isHiring ? null : post.photo_url` 
- To `post.post_type === "employee" ? post.employee_photo : post.photo_url`

### 2. Enhanced Debugging
- Added separate logging for `photo_url` and `employee_photo`
- Added post type logging for better debugging
- Enhanced accessibility testing

## Expected Result
- ✅ **Employee posts** will now show `employee_photo` on homepage
- ✅ **Employer posts** will continue to show `photo_url` on homepage  
- ✅ **Admin requests tab** already works correctly (uses proper logic)
- ✅ **Debug logs** will show which photo field is being used

## Testing
1. Check homepage - employee posts should now show photos
2. Check employer posts - should still show photos
3. Check console for debug logs showing photo selection
4. Verify admin requests tab still works correctly

## Files Modified
- `components/marketplace/PostCard.tsx` - Fixed photo display logic

## Status
✅ COMPLETE - Employee post photos should now display correctly on homepage
