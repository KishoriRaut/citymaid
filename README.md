# CityMaid Marketplace

A modern, production-ready Next.js marketplace application for connecting employers with workers. Built with authentication, responsive design, and best practices built-in.

## 🚀 Features

- **Authentication System**
  - User signup and login
  - Password hashing with bcrypt
  - Session management
  - Protected routes

- **Modern Tech Stack**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Supabase (Database)
  - Radix UI components

- **UI/UX**
  - Fully responsive design (mobile, tablet, desktop)
  - Loading states with spinners and skeletons
  - Smooth transitions and hover effects
  - Accessible focus states (WCAG compliant)
  - Dark mode ready

- **Code Quality**
  - Reusable utilities and hooks
  - Validation utilities
  - API timeout handling
  - Error handling
  - Type-safe throughout

- **Developer Experience**
  - Clean code structure
  - Comprehensive documentation
  - Easy configuration
  - Environment variable setup

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd citymaid

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database/supabase-setup.sql`
4. Click **Run** to execute

### 4. Customize Branding (Optional)

Edit `lib/config.ts` to customize:
- Brand name
- Tagline
- App name
- Routes
- Validation rules

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
citymaid/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── profile/           # Profile page
│   ├── signup/            # Signup page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # UI components (Button, Spinner, Skeleton)
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API utilities (timeout, error handling)
│   ├── config.ts         # App configuration
│   ├── db.ts             # Database functions
│   ├── hooks.ts          # Custom React hooks
│   ├── session.ts        # Session management
│   ├── validation.ts     # Validation utilities
│   └── utils.ts          # General utilities
├── database/              # Database setup files
│   └── supabase-setup.sql # SQL schema
└── public/               # Static assets
```

## 🎨 Customization

### Branding

Update `lib/config.ts`:

```typescript
export const appConfig = {
  brand: {
    name: "Your Brand Name",
    tagline: "Your Tagline",
    description: "Your Description",
  },
  // ... other config
};
```

Then update references in:
- `app/layout.tsx` (metadata, header, footer)
- `app/page.tsx` (homepage)

### Styling

- Colors: Edit CSS variables in `app/globals.css`
- Components: Modify `components/ui/*.tsx`
- Tailwind: Configure in `tailwind.config.ts`

### Routes

Update routes in `lib/config.ts`:

```typescript
routes: {
  home: "/",
  login: "/login",
  // ... customize as needed
}
```

## 🔒 Security

- Passwords are hashed with bcrypt before storage
- Service role key is server-side only
- Environment variables are not exposed to client
- Input validation on both client and server
- SQL injection protection via Supabase

## 📚 Documentation

- [Database Setup](./database/README.md)
- [Setup Guide](./SETUP.md)

## 🧪 Testing

1. Create an account at `/signup`
2. Verify user in Supabase dashboard → Table Editor → users
3. Login at `/login`
4. Access dashboard at `/dashboard`
5. Edit profile at `/profile`

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Other: Follow your platform's documentation

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a starter template. Feel free to:
- Fork and customize for your needs
- Add features and improvements
- Share your enhancements

## 📄 License

This marketplace application is provided as-is for building CityMaid-branded applications.

## 🆘 Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Check Supabase dashboard for database issues

## 🎯 Next Steps

After setting up:
1. Customize branding in `lib/config.ts`
2. Add your features and pages
3. Configure your domain
4. Set up production environment variables
5. Deploy!

---

**Built with ❤️ for CityMaid**
