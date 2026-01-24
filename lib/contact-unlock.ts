"use server";

import { supabase } from "./supabase";
import { getServerSession } from "./auth-server";
import { canViewContactViaRequest } from "./unlock-requests";
import type { Post } from "./types";

// Simple phone number masking function (replaces deleted contact-utils.ts)
function maskPhoneNumber(contact: string): string {
  if (!contact || contact.length < 4) return "****";
  
  const digitsOnly = contact.replace(/\D/g, "");
  const digitLength = digitsOnly.length;
  
  let startDigits: number;
  let endDigits: number;
  
  if (digitLength >= 10) {
    startDigits = digitLength >= 12 ? 3 : 2;
    endDigits = 2;
  } else if (digitLength >= 7) {
    startDigits = 2;
    endDigits = 2;
  } else {
    startDigits = 2;
    endDigits = 1;
  }
  
  const digits = contact.replace(/\D/g, "");
  const start = digits.slice(0, startDigits);
  const end = digits.slice(-endDigits);
  const maskedLength = digitLength - startDigits - endDigits;
  const masked = "*".repeat(Math.max(3, maskedLength));
  
  const countryCodeMatch = contact.match(/^(\+?\d{1,4}\s?)/);
  if (countryCodeMatch) {
    const countryCode = countryCodeMatch[1].trim();
    return `${countryCode} ${start}${masked}${end}`;
  }
  
  return `${start}${masked}${end}`;
}

// Contact unlock types
export interface ContactUnlock {
  id: string;
  post_id: string;
  viewer_user_id: string;
  payment_verified: boolean;
  payment_method?: string;
  payment_amount?: number;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// Check if user can view full contact information
export async function canViewFullContact(
  postId: string, 
  visitorId?: string | null
): Promise<boolean> {
  try {
    // If no visitor ID, they can't view
    if (!visitorId) {
      return false;
    }

    // Check if admin is viewing
    const session = await getServerSession();
    if (session?.email) {
      const { data: adminCheck } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.email)
        .single();
      
      if (adminCheck) {
        return true; // Admins can view all contacts
      }
    }

    // Check if visitor has paid for this contact via traditional unlock
    const { data: unlockRecord } = await supabase
      .from("contact_unlocks")
      .select("*")
      .eq("post_id", postId)
      .eq("viewer_user_id", visitorId)
      .eq("payment_verified", true)
      .single();

    if (unlockRecord) {
      return true;
    }

    // Check if visitor has approved unlock request
    const canViewViaRequest = await canViewContactViaRequest(postId, visitorId);
    return canViewViaRequest;
  } catch (error) {
    console.error("Error checking contact view permission:", error);
    return false;
  }
}

// Get contact display (masked or full)
export async function getContactDisplay(
  post: Post,
  visitorId?: string | null
): Promise<{ contact: string | null; canView: boolean }> {
  const canView = await canViewFullContact(post.id, visitorId);
  
  return {
    contact: canView ? post.contact : maskPhoneNumber(post.contact),
    canView
  };
}

// Create contact unlock record after payment
export async function createContactUnlock(
  postId: string,
  visitorId: string,
  paymentMethod: string,
  paymentAmount: number,
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if unlock already exists
    const { data: existingUnlock } = await supabase
      .from("contact_unlocks")
      .select("*")
      .eq("post_id", postId)
      .eq("viewer_user_id", visitorId)
      .single();

    if (existingUnlock) {
      return { success: true }; // Already unlocked
    }

    // Create new unlock record
    const { error } = await supabase
      .from("contact_unlocks")
      .insert({
        post_id: postId,
        viewer_user_id: visitorId,
        payment_verified: true,
        payment_method: paymentMethod,
        payment_amount: paymentAmount,
        transaction_id: transactionId,
      });

    if (error) {
      console.error("Error creating contact unlock:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createContactUnlock:", error);
    return { success: false, error: "Failed to create contact unlock" };
  }
}

// Get visitor's contact unlocks
export async function getVisitorContactUnlocks(
  visitorId: string
): Promise<{ unlocks: ContactUnlock[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("contact_unlocks")
      .select("*")
      .eq("viewer_user_id", visitorId)
      .eq("payment_verified", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching visitor contact unlocks:", error);
      return { unlocks: [], error: error.message };
    }

    return { unlocks: (data || []) as ContactUnlock[] };
  } catch (error) {
    console.error("Error in getVisitorContactUnlocks:", error);
    return { unlocks: [], error: "Failed to fetch contact unlocks" };
  }
}

// Check if post is unlocked by visitor
export async function isPostUnlockedByVisitor(
  postId: string,
  visitorId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("contact_unlocks")
      .select("id")
      .eq("post_id", postId)
      .eq("viewer_user_id", visitorId)
      .eq("payment_verified", true)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}
