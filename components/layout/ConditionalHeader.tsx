"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
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
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <Link
            href={appConfig.routes.home}
            className="text-lg sm:text-xl font-bold text-primary hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {appConfig.brand.name}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Link href={appConfig.routes.post}>
              <Button className="text-xs sm:text-sm shadow-sm hover:shadow transition-shadow duration-200 whitespace-nowrap">
                + Create Post
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" className="text-xs sm:text-sm font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200 whitespace-nowrap">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="px-4">
                    <h2 className="text-lg font-semibold">{appConfig.brand.name}</h2>
                    <p className="text-sm text-muted-foreground">Navigation Menu</p>
                  </div>
                  
                  <div className="px-4 space-y-3">
                    <Link href={appConfig.routes.post}>
                      <Button className="w-full justify-start shadow-sm hover:shadow transition-shadow duration-200">
                        + Create Post
                      </Button>
                    </Link>
                    <Link href="/admin/login">
                      <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200">
                        Admin
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
