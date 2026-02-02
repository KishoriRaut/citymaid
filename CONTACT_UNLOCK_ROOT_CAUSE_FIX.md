# Contact Unlock Payment Proof Issue - ROOT CAUSE FOUND & FIXED

## Problem Identified
You were absolutely right! The issue was in the **different data flows** between Post payments and Contact Unlock payments:

### Post Payment Flow
- User uploads payment proof → stored in `payments` table with `status: 'pending'`
- Admin shows them correctly (filter default was `'pending'`)

### Contact Unlock Payment Flow  
- User creates unlock request (`status: 'pending'`)
- User uploads payment proof → unified system updates to `status: 'paid'`
- **PROBLEM**: Admin filter defaulted to `'pending'` → filtered out `'paid'` requests!

## Root Cause
The admin requests page was defaulting to show only `'pending'` status requests, but contact unlock requests with payment proof have `status: 'paid'`, so they were being filtered out!

## Fix Applied

### Changed Default Filter
**File**: `app/admin/requests/page.tsx`
```typescript
// BEFORE (only showed pending requests)
const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("pending");

// AFTER (shows all requests including 'paid' contact unlocks)
const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("all");
```

## Expected Result
- ✅ **Contact unlock requests with payment proof will now show** in admin tab
- ✅ **Payment proof will display as "✅ Uploaded"** 
- ✅ **All request types will be visible** by default
- ✅ **Users can still filter by status** if needed

## Why This Makes Sense
1. **Post payments** stay in `'pending'` until admin approval
2. **Contact unlock payments** become `'paid'` after proof upload (automatic approval)
3. **Admin needs to see both** to manage the workflow properly

## Testing
1. Create a new contact unlock request
2. Upload payment proof  
3. Check admin requests page - should now show the request with payment proof ✅
4. Filter by "Contact Unlock" type - should see the request ✅
5. Payment proof should show "✅ Uploaded" ✅

Great catch on identifying the fundamental difference in the data flows! 🎯
