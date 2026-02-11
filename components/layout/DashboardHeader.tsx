"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { appConfig } from "@/lib/config";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function DashboardHeader({ onMenuToggle, isSidebarOpen }: DashboardHeaderProps) {
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
    <header className="border-b bg-background sticky top-0 z-30 sm:bg-background/95 sm:backdrop-blur sm:supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden mr-2"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Brand/Title */}
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {pathname === appConfig.routes.home && "Dashboard"}
              {pathname === appConfig.routes.post && "Create Post"}
              {pathname === "/settings" && "Settings"}
              {pathname === "/help" && "Help"}
            </h1>
          </div>

          {/* Right side - can add more items later */}
          <div className="flex items-center gap-2">
            {/* Space for future header items */}
          </div>
        </div>
      </div>
    </header>
  );
}
