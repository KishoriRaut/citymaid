"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { appConfig } from "@/lib/config";

// Global refs to store handlers
let createPostHandler: (() => void) | null = null;
let faqHandler: (() => void) | null = null;
let contactHandler: (() => void) | null = null;

export function ConditionalHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleCreatePost = () => {
    console.log('Create Post button clicked, calling handler');
    if (createPostHandler) {
      createPostHandler();
    } else {
      console.log('No createPostHandler found');
    }
  };

  const handleFAQ = () => {
    console.log('FAQ button clicked, calling handler');
    if (faqHandler) {
      faqHandler();
    } else {
      console.log('No faqHandler found');
    }
  };

  const handleContact = () => {
    console.log('Contact button clicked, calling handler');
    if (contactHandler) {
      contactHandler();
    } else {
      console.log('No contactHandler found');
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

  // Use dashboard layout for homepage and related pages
  const isHomePage = pathname === appConfig.routes.home;
  const isFAQPage = pathname === "/pages/faq";
  const isContactPage = pathname === "/pages/contact";
  
  if (isHomePage || isFAQPage || isContactPage) {
    return (
      <DashboardLayout 
        onCreatePost={handleCreatePost}
        onFAQ={handleFAQ}
        onContact={handleContact}
      >
        {children}
      </DashboardLayout>
    );
  }

  // For other pages, return null (they'll use their own layouts)
  return null;
}

// Export functions to register handlers
export const registerCreatePostHandler = (handler: () => void) => {
  createPostHandler = handler;
};

export const registerFAQHandler = (handler: () => void) => {
  faqHandler = handler;
};

export const registerContactHandler = (handler: () => void) => {
  contactHandler = handler;
};
