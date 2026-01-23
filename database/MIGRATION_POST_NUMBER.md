# Migration: Add Post Number

This migration adds a sequential numeric ID (`post_number`) to the posts table for user-friendly display.

## What This Does

- Adds `post_number` column (SERIAL) to posts table
- Automatically assigns sequential numbers: 1, 2, 3, 4...
- Backfills existing posts with numbers based on creation order
- Keeps UUID as primary key (for database integrity)
- Updates `get_public_posts()` function to include post_number

## How to Run

1. **Run the migration:**
   ```sql
   -- Copy and paste database/migrations/add-post-number.sql into Supabase SQL Editor
   ```

2. **Update the function:**
   ```sql
   -- Run database/fix-verify-get-public-posts.sql to update get_public_posts()
   ```

## Usage

After migration, posts will have:
- `id` (UUID) - Primary key, used for database references
- `post_number` (INTEGER) - Sequential number for display (1, 2, 3...)

You can display `post_number` in the UI for a cleaner, user-friendly ID.

## Example

```typescript
// Post object will now include:
{
  id: "uuid-here",
  post_number: 42,
  work: "Cooking",
  // ... other fields
}
```

## Notes

- Post numbers are assigned automatically when posts are created
- Numbers are sequential and unique
- Existing posts will be backfilled with numbers based on creation date
- UUID remains the primary key to maintain foreign key relationships
