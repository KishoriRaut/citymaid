/**
 * Application configuration
 * Customize these values for your Siscora-branded application
 */

export const appConfig = {
  // Brand Information
  brand: {
    name: "Siscora",
    tagline: "Building Smart Software Solutions",
    description: "Building Smart Software Solutions",
  },
  
  // App Information
  app: {
    name: "siscora-app",
    version: "0.1.0",
  },
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
  },
  
  // Validation Rules
  validation: {
    passwordMinLength: 8,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  // Routes
  routes: {
    home: "/",
    login: "/login",
    signup: "/signup",
    admin: "/admin",
    adminProfile: "/admin/profile",
    post: "/post",
    unlock: "/unlock",
    adminPosts: "/admin/posts",
    adminPayments: "/admin/payments",
  },
} as const;
