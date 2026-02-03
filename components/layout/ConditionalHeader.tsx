"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { appConfig } from "@/lib/config";
import AdminButton from "@/components/AdminButton";

export function ConditionalHeader() {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAdminPage(pathname?.startsWith("/admin") ?? false);
  }, [pathname]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || isAdminPage) {
    return null;
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50 sm:bg-background/95 sm:backdrop-blur sm:supports-[backdrop-filter]:bg-background/60">
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
            <AdminButton />
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access main navigation options and create new posts
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="px-4">
                    <h2 className="text-lg font-semibold">{appConfig.brand.name}</h2>
                    <p className="text-sm text-muted-foreground">Navigation Menu</p>
                  </div>
                  
                  <div className="px-4 space-y-3">
                    <SheetClose asChild>
                      <Link href={appConfig.routes.post}>
                        <Button className="w-full justify-start shadow-sm hover:shadow transition-shadow duration-200">
                          + Create Post
                        </Button>
                      </Link>
                    </SheetClose>
                    <div className="w-full">
                      <AdminButton />
                    </div>
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
