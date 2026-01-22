# CityMaid Marketplace Setup Guide

This guide will help you set up the CityMaid marketplace features.

## Prerequisites

1. Supabase project created
2. Database schema run (from `database/supabase-setup.sql`)
3. Environment variables configured

## Environment Variables

Add these to your `.env.local` file:

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New - Required for public pages
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find the anon key:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon/public** key (not the service_role key)

## Database Setup

1. **Run the SQL schema:**
   - Open Supabase SQL Editor
   - Copy and paste contents of `database/supabase-setup.sql`
   - Click **Run**

2. **Set up Storage Bucket (REQUIRED):**
   - Go to **Storage** in Supabase dashboard
   - Click **"New bucket"** or **"Create bucket"**
   - **Name:** `post-photos` (exact name, required)
   - **Public bucket:** Check this box (important!)
   - **File size limit:** 5MB (optional, recommended)
   - Click **"Create bucket"**
   - **Note:** The SQL script will try to create this automatically, but if it fails, you must create it manually

## Features Overview

### Public Pages (No Auth Required)

1. **Homepage (`/`)**
   - Lists approved posts
   - Filters by role (Hiring/Looking for Work) and work type
   - Pagination with "Load More"
   - Masked contacts until payment approved

2. **Create Post (`/post`)**
   - Form to create new posts
   - Role toggle (Hiring/Looking for Work)
   - Work type dropdown
   - Time, place, salary, contact fields
   - Optional photo upload
   - Posts created with status = 'pending'

3. **Unlock Contact (`/unlock/[postId]`)**
   - Payment form to unlock contact information
   - Stores visitor_id in localStorage
   - Creates payment record with status = 'pending'
   - Shows success message after submission

### Admin Pages (Auth Required)

1. **Admin Dashboard (`/admin`)**
   - Overview and quick links
   - Links to Posts and Payments management

2. **Posts Management (`/admin/posts`)**
   - View all posts (filter by status)
   - Approve pending posts
   - Hide/unhide posts
   - Delete posts

3. **Payments Management (`/admin/payments`)**
   - View all payment requests
   - Approve payments (unlocks contact for visitor)
   - Reject payments
   - Filter by status

## How It Works

### Contact Protection Flow

1. User creates a post → status = 'pending'
2. Admin approves post → status = 'approved'
3. Post appears on homepage with **masked contact** (e.g., `98****12`)
4. User clicks "Unlock Contact" → redirected to payment page
5. User submits payment → payment record created with status = 'pending'
6. Admin approves payment → contact becomes visible for that visitor_id
7. Contact is unlocked via the `get_public_posts()` function which checks payment status

### Database Functions

- `get_public_posts()` - Returns approved posts with contacts only if payment is approved
- This function is called automatically when fetching posts on the homepage

## Testing

1. **Test Post Creation:**
   - Go to `/post`
   - Fill out the form
   - Submit
   - Check Supabase Table Editor → `posts` table

2. **Test Admin Approval:**
   - Login as admin
   - Go to `/admin/posts`
   - Approve a pending post
   - Check homepage - post should appear

3. **Test Payment Flow:**
   - Click "Unlock Contact" on a post
   - Fill payment form
   - Submit
   - Check Supabase → `payments` table
   - Admin approves payment
   - Contact should be visible

## Troubleshooting

**Error: "get_public_posts function does not exist"**
- Make sure you ran the complete SQL schema
- Check that the function was created in Supabase SQL Editor

**Error: "Storage bucket not found"**
- Create the `post-photos` bucket in Supabase Storage
- Or run the storage SQL commands from the setup file

**Contacts are always visible:**
- Check that RLS policies are enabled
- Verify the `get_public_posts()` function is being used (not direct table queries)

**Photo upload fails:**
- Check that storage bucket exists and is public
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Check browser console for errors

## Next Steps

1. Customize the brand name in `lib/config.ts`
2. Add payment gateway integration (eSewa, etc.)
3. Add email notifications for approvals
4. Add search functionality
5. Add user accounts (optional)
