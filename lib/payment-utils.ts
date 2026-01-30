// Client-side utility functions for payment processing

import type { Post } from "./types";
import { useMemo } from "react";

// Helper to convert relative storage path to full Supabase URL
export function getSupabaseUrl(path: string | null): string | null {
  if (!path) return null;
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path;
  
  // If it's base64 data, return as-is (already complete)
  if (path.startsWith('data:')) return path;
  
  // Detect and filter out bad placeholder patterns that don't exist in storage
  if (path.includes('payment_proof_') && path.includes('_8b390f9b-95d2-451a-9569-1d30b4daad35_')) {
    console.warn('⚠️ Detected bad payment proof pattern, returning null:', path);
    return null;
  }
  
  // Convert relative path to full Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  
  // Check if path already includes bucket name
  if (path.includes('/')) {
    // Path includes bucket/filename format
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  } else {
    // Path is just filename, assume it's in payment-receipts bucket
    return `${supabaseUrl}/storage/v1/object/public/payment-receipts/${path}`;
  }
}

// Hook for memoized payment info to prevent excessive calls
export function usePaymentInfo(post: Post) {
  return useMemo(() => getPaymentInfo(post), [
    post.payments?.length,
    post.contact_unlock_requests?.length,
    post.homepage_payment_status,
    post.payment_proof
  ]);
}

export function getPaymentInfo(post: Post) {
  // Check homepage payments first (for post promotion)
  if (post.payments && post.payments.length > 0) {
    const latestPayment = post.payments[0]; // Assuming latest is first
    return {
      status: latestPayment.status as "pending" | "approved" | "rejected",
      receiptUrl: getSupabaseUrl(latestPayment.receipt_url),
      type: "homepage" as const
    };
  }
  
  // Check contact unlock payments
  if (post.contact_unlock_requests && post.contact_unlock_requests.length > 0) {
    const latestUnlock = post.contact_unlock_requests[0]; // Assuming latest is first
    return {
      status: latestUnlock.status as "pending" | "paid" | "approved" | "rejected",
      receiptUrl: getSupabaseUrl(latestUnlock.payment_proof),
      type: "contact_unlock" as const
    };
  }
  
  // Check post table fields (fallback)
  if (post.homepage_payment_status !== "none") {
    return {
      status: post.homepage_payment_status,
      receiptUrl: getSupabaseUrl(post.payment_proof),
      type: "post_table" as const
    };
  }
  
  return {
    status: "none" as const,
    receiptUrl: null,
    type: "none" as const
  };
}
