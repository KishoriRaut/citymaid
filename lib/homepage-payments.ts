"use server";

import { supabase } from "./supabase";

// Homepage payment types
export interface HomepagePaymentRequest {
  id: string;
  post_type: "employer" | "employee";
  work: string;
  time: string;
  place: string;
  salary: string;
  contact: string;
  photo_url: string | null;
  status: "pending" | "approved" | "hidden";
  homepage_payment_status: 'none' | 'pending' | 'approved' | 'rejected';
  payment_proof?: string | null;
  created_at: string;
  updated_at: string;
}

// Get posts with pending homepage payments
export async function getPendingHomepagePayments(): Promise<{ 
  requests?: HomepagePaymentRequest[]; 
  error?: string 
}> {
  try {
    const { data: requests, error } = await supabase
      .from("posts")
      .select("*")
      .eq("homepage_payment_status", "pending")
      .eq("status", "approved") // Only approved posts can request homepage feature
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting pending homepage payments:", error);
      return { error: "Failed to get pending homepage payments" };
    }

    return { requests: requests || [] };
  } catch (error) {
    console.error("Error in getPendingHomepagePayments:", error);
    return { error: "Failed to get pending homepage payments" };
  }
}

// Get all homepage payment requests (for admin dashboard)
export async function getAllHomepagePayments(
  status?: 'none' | 'pending' | 'approved' | 'rejected'
): Promise<{ 
  requests?: HomepagePaymentRequest[]; 
  error?: string 
}> {
  try {
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("homepage_payment_status", status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Error getting homepage payments:", error);
      return { error: "Failed to get homepage payments" };
    }

    return { requests: requests || [] };
  } catch (error) {
    console.error("Error in getAllHomepagePayments:", error);
    return { error: "Failed to get homepage payments" };
  }
}

// Approve homepage payment
export async function approveHomepagePayment(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update post homepage payment status
    const { error } = await supabase
      .from("posts")
      .update({ homepage_payment_status: 'approved' })
      .eq("id", postId);

    if (error) {
      console.error("Error approving homepage payment:", error);
      return { success: false, error: "Failed to approve homepage payment" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in approveHomepagePayment:", error);
    return { success: false, error: "Failed to approve homepage payment" };
  }
}

// Reject homepage payment
export async function rejectHomepagePayment(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update post homepage payment status
    const { error } = await supabase
      .from("posts")
      .update({ homepage_payment_status: 'rejected' })
      .eq("id", postId);

    if (error) {
      console.error("Error rejecting homepage payment:", error);
      return { success: false, error: "Failed to reject homepage payment" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in rejectHomepagePayment:", error);
    return { success: false, error: "Failed to reject homepage payment" };
  }
}

// Update homepage payment with proof
export async function updateHomepagePaymentProof(
  postId: string,
  paymentProofUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update post with payment proof and set status to pending
    const { error } = await supabase
      .from("posts")
      .update({ 
        homepage_payment_status: 'pending',
        payment_proof: paymentProofUrl
      })
      .eq("id", postId);

    if (error) {
      console.error("Error updating homepage payment proof:", error);
      return { success: false, error: "Failed to update homepage payment proof" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateHomepagePaymentProof:", error);
    return { success: false, error: "Failed to update homepage payment proof" };
  }
}
