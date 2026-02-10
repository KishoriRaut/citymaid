"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Link 
            href="/pages/privacy-policy" 
            className="text-sm hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/pages/terms" 
            className="text-sm hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            href="/pages/about" 
            className="text-sm hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link 
            href="/pages/contact" 
            className="text-sm hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link 
            href="/pages/faq" 
            className="text-sm hover:text-primary transition-colors"
          >
            FAQ
          </Link>
        </div>
        <div className="text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {appConfig.brand.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
