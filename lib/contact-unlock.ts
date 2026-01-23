"use server";

import { supabase } from "./supabase";
import { getServerSession } from "./auth-server";
import { maskPhoneNumber } from "./contact-utils";
import type { Post } from "./types";

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
  viewerUserId?: string | null
): Promise<boolean> {
  try {
    // If no viewer user ID, they can't view
    if (!viewerUserId) {
      return false;
    }

    // Check if user is admin
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

    // Check if user has paid for this contact
    const { data: unlockRecord } = await supabase
      .from("contact_unlocks")
      .select("*")
      .eq("post_id", postId)
      .eq("viewer_user_id", viewerUserId)
      .eq("payment_verified", true)
      .single();

    return !!unlockRecord;
  } catch (error) {
    console.error("Error checking contact view permission:", error);
    return false;
  }
}

// Get contact display (masked or full)
export async function getContactDisplay(
  post: Post,
  viewerUserId?: string | null
): Promise<{ contact: string | null; canView: boolean }> {
  const canView = await canViewFullContact(post.id, viewerUserId);
  
  return {
    contact: canView ? post.contact : maskPhoneNumber(post.contact),
    canView
  };
}

// Create contact unlock record after payment
export async function createContactUnlock(
  postId: string,
  userId: string,
  paymentMethod: string,
  paymentAmount: number,
  transactionId?: string,
  isVisitorId: boolean = false // Flag to indicate if userId is a visitor_id
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if unlock already exists
    const existingQuery = isVisitorId
      ? supabase
          .from("contact_unlocks")
          .select("*")
          .eq("post_id", postId)
          .eq("visitor_id", userId)
          .single()
      : supabase
          .from("contact_unlocks")
          .select("*")
          .eq("post_id", postId)
          .eq("viewer_user_id", userId)
          .single();

    const { data: existingUnlock } = await existingQuery;

    if (existingUnlock) {
      return { success: true }; // Already unlocked
    }

    // Create new unlock record
    const insertData = isVisitorId
      ? {
          post_id: postId,
          visitor_id: userId,
          payment_verified: true,
          payment_method: paymentMethod,
          payment_amount: paymentAmount,
          transaction_id: transactionId,
        }
      : {
          post_id: postId,
          viewer_user_id: userId,
          payment_verified: true,
          payment_method: paymentMethod,
          payment_amount: paymentAmount,
          transaction_id: transactionId,
        };

    const { error } = await supabase
      .from("contact_unlocks")
      .insert(insertData);

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

// Get user's contact unlocks
export async function getUserContactUnlocks(
  userId: string
): Promise<{ unlocks: ContactUnlock[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("contact_unlocks")
      .select("*")
      .eq("viewer_user_id", userId)
      .eq("payment_verified", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user contact unlocks:", error);
      return { unlocks: [], error: error.message };
    }

    return { unlocks: (data || []) as ContactUnlock[] };
  } catch (error) {
    console.error("Error in getUserContactUnlocks:", error);
    return { unlocks: [], error: "Failed to fetch contact unlocks" };
  }
}

// Check if post is unlocked by user
export async function isPostUnlockedByUser(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("contact_unlocks")
      .select("id")
      .eq("post_id", postId)
      .eq("viewer_user_id", userId)
      .eq("payment_verified", true)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}
