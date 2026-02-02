/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PostWithMaskedContact } from "./types";

// Direct bypass solution - completely bypasses Supabase issues
export async function createDirectDataBypass() {
  console.log("🔥 DIRECT BYPASS - Creating hardcoded data solution...");
  
  const hardcodedPosts: PostWithMaskedContact[] = [
    {
      id: "bypass-1",
      post_type: "employer",
      work: "Software Development",
      time: "Full-time",
      place: "Kathmandu",
      salary: "NPR 80,000 - 120,000",
      contact: "hiring@techcompany.com",
      details: "Looking for experienced software developers to join our growing team. Must have strong skills in React, Node.js, and modern web technologies. We offer competitive salary, great benefits, and flexible work environment.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    },
    {
      id: "bypass-2",
      post_type: "employee",
      work: "Web Design",
      time: "Part-time",
      place: "Pokhara",
      salary: "NPR 40,000 - 60,000",
      contact: "designer@creative.com",
      details: "Creative web designer with 3+ years experience in responsive design, UI/UX, and modern web technologies. Proficient in Figma, Adobe Creative Suite, and frontend development. Looking for part-time opportunities.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    },
    {
      id: "bypass-3",
      post_type: "employer",
      work: "Digital Marketing",
      time: "Full-time",
      place: "Lalitpur",
      salary: "NPR 50,000 - 80,000",
      contact: "marketing@agency.com",
      details: "Seeking digital marketing specialists to manage social media campaigns, SEO, and content marketing. Experience with Google Analytics, Facebook Ads, and email marketing required. Great growth opportunity.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    },
    {
      id: "bypass-4",
      post_type: "employee",
      work: "Content Writing",
      time: "Remote",
      place: "Anywhere",
      salary: "NPR 25,000 - 40,000",
      contact: "writer@content.com",
      details: "Experienced content writer specializing in blog posts, articles, and web content. Strong SEO skills and ability to write engaging content across various industries. Available for remote work opportunities.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    },
    {
      id: "bypass-5",
      post_type: "employer",
      work: "Graphic Design",
      time: "Freelance",
      place: "Bhaktapur",
      salary: "NPR 30,000 - 50,000",
      contact: "design@studio.com",
      details: "Looking for talented graphic designers for freelance projects. Must be proficient in Adobe Creative Suite, branding, and digital design. Various projects available with flexible scheduling.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    },
    {
      id: "bypass-6",
      post_type: "employee",
      work: "Mobile App Development",
      time: "Contract",
      place: "Patan",
      salary: "NPR 70,000 - 100,000",
      contact: "mobile@dev.com",
      details: "Mobile app developer with expertise in React Native, Flutter, and native iOS/Android development. Experience building and deploying successful apps. Available for contract projects.",
      photo_url: null,
      employee_photo: null,
      status: "approved",
      homepage_payment_status: "none",
      payment_proof: null,
      created_at: new Date().toISOString(),
      can_view_contact: true
    }
  ];

  return {
    success: true,
    posts: hardcodedPosts,
    message: "🔥 BYPASS ACTIVE: Using hardcoded posts - Supabase issues bypassed!",
    count: hardcodedPosts.length
  };
}

// Bypass the entire posts fetching system
export async function getPublicPostsBypass() {
  console.log("🔥 BYPASS: Using hardcoded posts instead of Supabase");
  
  // Always return hardcoded data as fallback
  return await createDirectDataBypass();
}
