"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { appConfig } from "@/lib/config";

// Global refs to store handlers
let createPostHandler: (() => void) | null = null;
let createProfileHandler: (() => void) | null = null;
let postJobHandler: (() => void) | null = null;
let faqHandler: (() => void) | null = null;
let contactHandler: (() => void) | null = null;
let howItWorksHandler: (() => void) | null = null;

export function ConditionalHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleCreateProfile = () => {
    console.log('Create Profile button clicked, calling handler');
    if (createProfileHandler) {
      createProfileHandler();
    } else {
      console.log('No createProfileHandler found');
    }
  };

  const handlePostJob = () => {
    console.log('Post Job button clicked, calling handler');
    if (postJobHandler) {
      postJobHandler();
    } else {
      console.log('No postJobHandler found');
    }
  };

  const handleCreatePost = () => {
    console.log('Create Post button clicked, calling handler');
    if (createPostHandler) {
      createPostHandler();
    } else {
      console.log('No createPostHandler found');
    }
  };

  const handleHowItWorks = () => {
    console.log('How It Works button clicked, calling handler');
    if (howItWorksHandler) {
      howItWorksHandler();
    } else {
      console.log('No howItWorksHandler found');
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
  const isAboutPage = pathname === "/pages/about";
  const isPostPage = pathname === "/post";
  
  if (isHomePage || isFAQPage || isContactPage || isAboutPage || isPostPage) {
    return (
      <DashboardLayout 
        onCreatePost={handleCreatePost}
        onCreateProfile={handleCreateProfile}
        onPostJob={handlePostJob}
        onFAQ={handleFAQ}
        onContact={handleContact}
        onHowItWorks={handleHowItWorks}
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

export const registerCreateProfileHandler = (handler: () => void) => {
  createProfileHandler = handler;
};

export const registerPostJobHandler = (handler: () => void) => {
  postJobHandler = handler;
};

export const registerFAQHandler = (handler: () => void) => {
  faqHandler = handler;
};

export const registerContactHandler = (handler: () => void) => {
  contactHandler = handler;
};

export const registerHowItWorksHandler = (handler: () => void) => {
  howItWorksHandler = handler;
};
