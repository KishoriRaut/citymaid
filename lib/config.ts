/**
 * Application configuration
 * Customize these values for your CityMaid-branded application
 */

export const appConfig = {
  // Brand Information
  brand: {
    name: "City Maid Services Pvt. Ltd.",
    tagline: "Find work or hire help in your city",
    description: "CityMaid Marketplace - Connect employers with workers for local services",
  },
  
  // App Information
  app: {
    name: "citymaid",
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
    payment: "/payment",
    admin: "/admin/requests", // Default to requests page
    adminProfile: "/admin/profile",
    post: "/post",
    unlock: "/unlock",
  },
} as const;
