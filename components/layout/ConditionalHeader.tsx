"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import { appConfig } from "@/lib/config";

export function ConditionalHeader() {
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

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <Link
            href={appConfig.routes.home}
            className="text-lg sm:text-xl font-bold text-primary hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {appConfig.brand.name}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={appConfig.routes.post}>
              <Button className="text-xs sm:text-sm shadow-sm hover:shadow transition-shadow duration-200 whitespace-nowrap">
                + Create Post
              </Button>
            </Link>
            <Link
              href="/admin/login"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 py-1.5 sm:px-3 sm:py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Admin
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
