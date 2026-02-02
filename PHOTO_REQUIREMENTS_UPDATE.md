# Photo Requirements Update - Employee vs Employer

## Problem Identified
The post form had the same photo requirements for both employee and employer posts, but they should be different:
- **Employee posts**: Photo should be **mandatory** (job seekers need to show themselves)
- **Employer posts**: Photo should be **optional** (employers posting job requirements don't need personal photos)

## Changes Made

### 1. Updated Form Schema Validation
**File**: `app/post/page.tsx`
```typescript
// BEFORE - Photo optional for both
photo: z.any().optional(),

// AFTER - Conditional validation
photo: z.any().refine((data) => {
  // If employee post, photo is required
  if (data?.post_type === "employee") {
    return data && data instanceof File && data.size > 0;
  }
  // If employer post, photo is optional
  return true;
}, {
  message: "Photo is required for employee posts"
}),
```

### 2. Updated Form UI Labels
**File**: `app/post/page.tsx`
```typescript
// Dynamic label based on post type
<FormLabel>
  Photo {postType === "employee" ? "(Required)" : "(Optional)"}
</FormLabel>

// Dynamic HTML attribute
<Input
  type="file"
  accept="image/*"
  required={postType === "employee"}
/>

// Dynamic description
<FormDescription>
  {postType === "employee" 
    ? "Upload your photo (required for employee job applications)"
    : "Upload a relevant photo for your job posting (optional)"
  }
</FormDescription>
```

## Expected Behavior

### Employee Posts ("Find a Job")
- ✅ **Photo field is required**
- ✅ **Form validation prevents submission without photo**
- ✅ **Label shows "Photo (Required)"**
- ✅ **Description explains requirement**
- ✅ **HTML required attribute enforced**

### Employer Posts ("Hire a Worker")  
- ✅ **Photo field is optional**
- ✅ **Form can be submitted without photo**
- ✅ **Label shows "Photo (Optional)"**
- ✅ **Description explains it's optional**
- ✅ **No HTML required attribute**

## Testing
1. **Test Employee Post**: Try to submit without photo → Should show validation error ✅
2. **Test Employer Post**: Submit without photo → Should work fine ✅
3. **Test Both**: Upload photos → Should work correctly ✅

## Files Modified
- `app/post/page.tsx` - Updated schema validation and UI for conditional photo requirements

## Status
✅ COMPLETE - Photo requirements now properly differentiated between employee and employer posts
