"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { appConfig } from "@/lib/config";

// Global ref to store the create post handler
let createPostHandler: (() => void) | null = null;

export function ConditionalHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleCreatePost = () => {
    console.log('Create Post button clicked, calling handler');
    // Call the handler directly if it exists
    if (createPostHandler) {
      createPostHandler();
    } else {
      console.log('No createPostHandler found');
    }
  };

  useEffect(() => {
    setMounted(true);
    setIsAdminPage(pathname?.startsWith("/admin") ?? false);
  }, [pathname]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || isAdminPage) {
    return null;
  }

  // Use dashboard layout for homepage, regular header for other pages
  const isHomePage = pathname === appConfig.routes.home;
  
  if (isHomePage) {
    return <DashboardLayout onCreatePost={handleCreatePost}>{children}</DashboardLayout>;
  }

  // For other pages, return null (they'll use their own layouts)
  return null;
}

// Export function to register the handler
export const registerCreatePostHandler = (handler: () => void) => {
  createPostHandler = handler;
};
