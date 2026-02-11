"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { appConfig } from "@/lib/config";

export function ConditionalHeader({ children, onCreatePost }: { children?: React.ReactNode; onCreatePost?: () => void }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    return <DashboardLayout onCreatePost={onCreatePost}>{children}</DashboardLayout>;
  }

  // For other pages, return null (they'll use their own layouts)
  return null;
}
