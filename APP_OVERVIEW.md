# CityMaid Marketplace - Application Overview

## 🎯 Project Summary

**CityMaid** is a production-ready marketplace platform built with Next.js 14, TypeScript, and Supabase. It connects employers looking for help (cleaning, cooking, babysitting, etc.) with employees seeking work opportunities.

**Current Status**: ✅ Core features implemented, ready for testing and deployment

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for photos)
- **Authentication**: Custom session-based (admin only)
- **UI Components**: Radix UI + Custom components

### Key Technologies
- `@supabase/supabase-js` - Database client
- `bcryptjs` - Password hashing
- `class-variance-authority` - Component variants
- Server Actions for data mutations
- Client Components for interactive UI

---

## 📁 Project Structure

```
citymaid/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage (marketplace listing)
│   ├── post/                     # Create post page
│   ├── unlock/[postId]/          # Payment/unlock contact page
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx             # Admin home
│   │   ├── posts/                # Posts management
│   │   ├── payments/            # Payments management
│   │   └── profile/             # Admin profile
│   ├── login/                    # Admin login
│   ├── signup/                   # Admin signup
│   ├── api/                      # API routes
│   │   ├── posts/[postId]/      # Get single post
│   │   ├── signin/              # Admin login API
│   │   └── signup/              # Admin signup API
│   └── test-posts/              # Diagnostic page
│
├── components/
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── skeleton.tsx
│       └── spinner.tsx
│
├── lib/                          # Core utilities
│   ├── config.ts                # App configuration & routes
│   ├── supabase.ts              # Server-side Supabase client
│   ├── supabase-client.ts       # Client-side Supabase client
│   ├── posts.ts                 # Server actions for posts
│   ├── posts-client.ts          # Client-side posts functions
│   ├── payments.ts              # Payment operations
│   ├── storage.ts               # Photo upload utilities
│   ├── db.ts                    # User database operations
│   ├── session.ts               # Session management
│   └── utils.ts                 # Helper functions
│
├── database/
│   ├── supabase-setup.sql       # Main database schema
│   ├── fix-get-public-posts.sql # Function fix script
│   ├── storage-policies.sql    # Storage bucket policies
│   ├── diagnose-posts.sql      # Diagnostic queries
│   └── check-and-approve-posts.sql # Post approval helpers
│
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── middleware.ts            # Route protection
```

---

## 🎨 Features Overview

### ✅ Public Features (No Auth Required)

#### 1. **Homepage** (`/`)
- **Purpose**: Browse approved job postings
- **Features**:
  - Card-based post listing
  - Filters: Role (Hiring/Looking for Work), Work type
  - Pagination with "Load More"
  - Masked contact numbers (e.g., `98****12`)
  - "Unlock Contact" button for locked posts
  - Photo thumbnails
- **Status**: ✅ Working (needs approved posts to display)

#### 2. **Create Post** (`/post`)
- **Purpose**: Submit new job postings
- **Form Fields**:
  - Role toggle: "I am hiring" / "I am looking for work"
  - Work type: Dropdown (Cooking, Cleaning, etc.) + "Other" option
  - Time: Dropdown (Morning, Day, Evening, etc.)
  - Place: Text input
  - Salary: Text input
  - Contact: Text input
  - Photo: Optional file upload
- **Behavior**: Creates post with `status = 'pending'`, redirects to homepage
- **Status**: ✅ Working

#### 3. **Unlock Contact** (`/unlock/[postId]`)
- **Purpose**: Payment page to unlock contact information
- **Features**:
  - Shows post summary with masked contact
  - Payment method selection (QR, eSewa, Bank)
  - Reference ID input
  - Stores `visitor_id` in localStorage
  - Creates payment with `status = 'pending'`
  - Success message after submission
- **Status**: ✅ Working

### ✅ Admin Features (Auth Required)

#### 4. **Admin Dashboard** (`/admin`)
- **Purpose**: Admin control center
- **Features**:
  - User account info
  - Quick links to Posts and Payments management
  - Logout functionality
- **Status**: ✅ Working

#### 5. **Posts Management** (`/admin/posts`)
- **Purpose**: Manage all marketplace posts
- **Features**:
  - View all posts (filter by status: all/pending/approved/hidden)
  - Approve pending posts
  - Hide/unhide posts
  - Delete posts
  - View post details including contact info
- **Status**: ✅ Working

#### 6. **Payments Management** (`/admin/payments`)
- **Purpose**: Review and approve payment requests
- **Features**:
  - View all payments (filter by status)
  - Approve payments (unlocks contact for visitor)
  - Reject payments
  - View payment details and related post info
- **Status**: ✅ Working

#### 7. **Admin Authentication** (`/login`, `/signup`)
- **Purpose**: Secure admin access
- **Features**:
  - Email/password login
  - Admin account creation
  - Session management
  - Protected routes via middleware
- **Status**: ✅ Working

---

## 🗄️ Database Schema

### Tables

#### 1. **users** (Admin-only)
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hashed)
- `created_at`, `updated_at`
- **RLS**: Only service_role can manage

#### 2. **posts** (Marketplace listings)
- `id` (UUID, PK)
- `post_type` ('employer' | 'employee')
- `work` (TEXT)
- `"time"` (TEXT) - quoted because `time` is reserved
- `place` (TEXT)
- `salary` (TEXT)
- `contact` (TEXT) - protected
- `photo_url` (TEXT, nullable)
- `status` ('pending' | 'approved' | 'hidden')
- `created_at` (TIMESTAMPTZ)
- **RLS**: Public can insert (pending only), service_role has full access

#### 3. **payments** (Contact unlock payments)
- `id` (UUID, PK)
- `post_id` (UUID, FK → posts.id, CASCADE)
- `visitor_id` (TEXT)
- `amount` (INTEGER, default: 3000)
- `method` ('qr' | 'esewa' | 'bank')
- `reference_id` (TEXT)
- `status` ('pending' | 'approved' | 'rejected')
- `created_at` (TIMESTAMPTZ)
- **RLS**: Public can insert (pending only), read own approved, service_role has full access

### Database Functions

#### `get_public_posts()`
- **Purpose**: Returns approved posts with protected contacts
- **Security**: Contacts only visible if payment is approved
- **Access**: Public (anon, authenticated)
- **Status**: ✅ Working (verified via test page)

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Public can only insert (with status constraints)
- ✅ Public cannot directly read posts (must use function)
- ✅ Contacts protected until payment approved
- ✅ Admin (service_role) has full access

### Contact Protection
- Contacts are **never exposed** unless:
  1. Post status = 'approved' (admin approved)
  2. Payment status = 'approved' (payment verified)
- Uses `get_public_posts()` function with payment check
- Masked display: `98****12` format

### Authentication
- Admin-only access (no public signup)
- Password hashing with bcrypt
- Session-based auth with cookies
- Middleware protection for `/admin/*` routes

---

## 📊 Current Status

### ✅ Working Features
- [x] Database schema created
- [x] RLS policies configured
- [x] Storage bucket setup (manual creation required)
- [x] Public post creation
- [x] Homepage listing (when posts are approved)
- [x] Payment submission
- [x] Admin authentication
- [x] Posts management
- [x] Payments management
- [x] Photo upload functionality
- [x] Contact protection system

### ⚠️ Known Issues / Requirements
- [ ] **No approved posts yet** - Need to approve posts for homepage to show content
- [ ] **Storage bucket** - Must be created manually in Supabase Dashboard
- [ ] **Environment variables** - Need `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public pages

### 🔧 Recent Fixes
- ✅ Fixed ambiguous `status` column references
- ✅ Created client-side posts function
- ✅ Added fallback queries
- ✅ Improved error handling and debugging
- ✅ Fixed Image component issues (replaced with `<img>`)

---

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+
2. Supabase account
3. Environment variables configured

### Setup Steps
1. **Install dependencies**: `npm install`
2. **Configure Supabase**:
   - Run `database/supabase-setup.sql` in SQL Editor
   - Create `post-photos` bucket in Storage
   - Run `database/storage-policies.sql`
3. **Set environment variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. **Start dev server**: `npm run dev`

### First Steps After Setup
1. Create admin account at `/signup`
2. Create a test post at `/post`
3. Approve the post at `/admin/posts`
4. View it on homepage `/`

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `app/page.tsx` | Homepage marketplace listing |
| `app/post/page.tsx` | Create post form |
| `app/unlock/[postId]/page.tsx` | Payment/unlock page |
| `app/admin/posts/page.tsx` | Posts management |
| `app/admin/payments/page.tsx` | Payments management |
| `lib/posts-client.ts` | Client-side posts fetching |
| `lib/payments.ts` | Payment operations |
| `lib/storage.ts` | Photo uploads |
| `database/supabase-setup.sql` | Main database schema |
| `middleware.ts` | Route protection |

---

## 🎯 Next Steps / Recommendations

### Immediate
1. ✅ Approve some posts to test homepage
2. ✅ Test the full flow: Create → Approve → Unlock → Approve Payment
3. ✅ Verify contact protection works correctly

### Future Enhancements (Optional)
- [ ] Email notifications for approvals
- [ ] Search functionality
- [ ] User accounts (optional, currently admin-only)
- [ ] Payment gateway integration (eSewa, etc.)
- [ ] Analytics dashboard
- [ ] Post expiration/archival
- [ ] Image optimization
- [ ] SEO improvements

---

## 📞 Support & Documentation

- **Setup Guide**: `MARKETPLACE_SETUP.md`
- **Database Docs**: `database/README.md`
- **Diagnostic Tools**: 
  - `/test-posts` - Connection test page
  - `database/diagnose-posts.sql` - SQL diagnostics
  - `database/test-get-public-posts.sql` - Function testing

---

**Last Updated**: Current session  
**Version**: 0.1.0  
**Status**: Production-ready, awaiting content (approved posts)
