"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { appConfig } from "@/lib/config";

export function ConditionalHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleCreatePost = () => {
    console.log('Create Post button clicked, dispatching event');
    // Dispatch custom event to open the post creation form
    window.dispatchEvent(new CustomEvent('openCreatePost'));
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
