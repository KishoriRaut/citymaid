"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { appConfig } from "@/lib/config";

export function ConditionalFooter() {
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
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {appConfig.brand.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
