# Tech Stack & Branding Information

## 🛠️ Technology Stack

### ✅ shadcn/ui
- **Version**: Latest (via components.json)
- **Style**: New York variant
- **Configuration**: `components.json`
- **Components Used**:
  - Button (with Radix UI Slot)
  - Custom: Spinner, Skeleton
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **RSC**: Enabled (React Server Components)

### ✅ TypeScript
- **Version**: 5.x
- **Configuration**: `tsconfig.json`
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` → `./*`
- **Module Resolution**: Bundler
- **All files**: `.ts` and `.tsx`

### ✅ Tailwind CSS
- **Version**: 3.4.1
- **Configuration**: `tailwind.config.ts`
- **Dark Mode**: Class-based (`darkMode: ["class"]`)
- **Plugins**: 
  - `tailwindcss-animate` (for animations)
- **Custom Colors**: HSL-based CSS variables
- **Custom Border Radius**: Variable-based

## 🎨 Branding Colors

### Light Mode Colors (HSL values)

| Color | HSL Value | Hex Equivalent | Usage |
|-------|-----------|---------------|-------|
| **Primary** | `221 83% 53%` | `#3B82F6` (Blue) | Main brand color, buttons, links |
| **Background** | `0 0% 100%` | `#FFFFFF` (White) | Page background |
| **Foreground** | `222 47% 11%` | `#0F172A` (Dark Blue) | Text color |
| **Secondary** | `222 47% 11%` | `#0F172A` | Secondary elements |
| **Accent** | `142 71% 45%` | `#10B981` (Green) | Accent color |
| **Muted** | `0 0% 96.1%` | `#F5F5F5` | Muted backgrounds |
| **Muted Foreground** | `0 0% 45.1%` | `#737373` | Muted text |
| **Destructive** | `0 84.2% 60.2%` | `#EF4444` (Red) | Error states |
| **Border** | `0 0% 89.8%` | `#E5E5E5` | Borders |
| **Input** | `0 0% 89.8%` | `#E5E5E5` | Input borders |
| **Ring** | `221 83% 53%` | `#3B82F6` | Focus rings |

### Dark Mode Colors (HSL values)

| Color | HSL Value | Hex Equivalent | Usage |
|-------|-----------|---------------|-------|
| **Primary** | `221 83% 53%` | `#3B82F6` (Blue) | Same as light mode |
| **Background** | `222 47% 11%` | `#0F172A` | Dark background |
| **Foreground** | `0 0% 98%` | `#FAFAFA` | Light text |
| **Card** | `222 47% 15%` | `#1E293B` | Card backgrounds |
| **Muted** | `0 0% 14.9%` | `#262626` | Muted backgrounds |
| **Border** | `0 0% 14.9%` | `#262626` | Dark borders |
| **Destructive** | `0 62.8% 30.6%` | `#991B1B` | Dark error states |

### Color System
- **Format**: HSL (Hue, Saturation, Lightness)
- **Implementation**: CSS Custom Properties (Variables)
- **Location**: `app/globals.css`
- **Theme Support**: Full dark mode support

## 🔤 Typography

### Primary Font
- **Font Family**: **Inter**
- **Source**: Google Fonts
- **Subsets**: Latin
- **CSS Variable**: `--font-inter`
- **Usage**: Applied via `font-sans` class
- **Features**: 
  - Antialiased rendering
  - Font feature settings: `"rlig" 1, "calt" 1`

### Font Weights Used
- **Bold** (700): Headings (`font-bold`)
- **Semibold** (600): Subheadings (`font-semibold`)
- **Medium** (500): Labels, buttons (`font-medium`)
- **Regular** (400): Body text (default)

### Font Sizes (Responsive)
- **Headings**: `text-2xl sm:text-3xl lg:text-4xl`
- **Subheadings**: `text-base sm:text-lg`
- **Body**: `text-sm sm:text-base`
- **Small**: `text-xs sm:text-sm`

## 📦 Key Dependencies

### Core Framework
- **Next.js**: 14.2.35 (App Router)
- **React**: 18.x
- **TypeScript**: 5.x

### UI & Styling
- **Tailwind CSS**: 3.4.1
- **shadcn/ui**: Latest (New York style)
- **Radix UI**: @radix-ui/react-slot
- **class-variance-authority**: 0.7.1
- **tailwind-merge**: 3.4.0
- **tailwindcss-animate**: 1.0.7

### Backend & Database
- **Supabase**: @supabase/supabase-js 2.90.1
- **bcryptjs**: 2.4.3 (Password hashing)

### Utilities
- **clsx**: 2.1.1 (Conditional classes)
- **server-only**: 0.0.1 (Server-side only code)

## 🎯 Design System

### Border Radius
- **Large**: `0.5rem` (8px) - `--radius`
- **Medium**: `calc(var(--radius) - 2px)` (6px)
- **Small**: `calc(var(--radius) - 4px)` (4px)

### Spacing
- Uses Tailwind's default spacing scale
- Responsive padding: `p-4 sm:p-6 lg:p-8`
- Responsive gaps: `gap-4 sm:gap-6`

### Shadows
- **Small**: `shadow-sm` (Cards)
- **Medium**: `shadow-md` (Hover states)
- **Default**: `shadow` (Buttons)

### Transitions
- **Duration**: 200ms (`duration-200`)
- **Types**: `transition-colors`, `transition-all`, `transition-shadow`

## 📝 Summary

**Tech Stack**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui  
**Primary Color**: Blue (`#3B82F6` / `hsl(221, 83%, 53%)`)  
**Font**: Inter (Google Fonts)  
**Design System**: shadcn/ui (New York style) with custom colors  
**Dark Mode**: Fully supported

---

*All colors and fonts are configurable via CSS variables in `app/globals.css`*
