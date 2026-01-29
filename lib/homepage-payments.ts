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
    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        posts (
          id,
          post_type,
          work,
          time,
          place,
          salary,
          contact,
          photo_url,
          status,
          created_at
        )
      `)
      .eq("payment_type", "post_promotion")
      .eq("status", "pending")
      .eq("posts.status", "approved") // Only approved posts can request homepage feature
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting pending homepage payments:", error);
      return { error: "Failed to get pending homepage payments" };
    }

    // Transform the data to match the expected interface
    const requests = payments?.map(payment => ({
      ...payment.posts,
      homepage_payment_status: 'pending',
      payment_proof: payment.receipt_url,
      updated_at: payment.created_at
    })) || [];

    return { requests };
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
      .from("payments")
      .select(`
        *,
        posts (
          id,
          post_type,
          work,
          time,
          place,
          salary,
          contact,
          photo_url,
          status,
          created_at
        )
      `)
      .eq("payment_type", "post_promotion")
      .order("created_at", { ascending: false });

    if (status && status !== 'none') {
      query = query.eq("status", status);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error("Error getting homepage payments:", error);
      return { error: "Failed to get homepage payments" };
    }

    // Transform the data to match the expected interface
    const requests = payments?.map(payment => ({
      ...payment.posts,
      homepage_payment_status: payment.status,
      payment_proof: payment.receipt_url,
      updated_at: payment.created_at
    })) || [];

    return { requests };
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
    // Update payment status to approved
    const { error } = await supabase
      .from("payments")
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq("post_id", postId)
      .eq("payment_type", "post_promotion");

    if (error) {
      console.error("Error approving homepage payment:", error);
      return { success: false, error: "Failed to approve homepage payment" };
    }

    // Update post status to approved
    const { error: postError } = await supabase
      .from("posts")
      .update({ status: 'approved' })
      .eq("id", postId);

    if (postError) {
      console.error("Error updating post status:", postError);
      return { success: false, error: "Failed to update post status" };
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
    // Update payment status to rejected
    const { error } = await supabase
      .from("payments")
      .update({ status: 'rejected' })
      .eq("post_id", postId)
      .eq("payment_type", "post_promotion");

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
    console.log("Updating homepage payment proof:", { postId, paymentProofUrl });
    
    // Create payment record in unified payments table
    const { data, error } = await supabase
      .from("payments")
      .insert({
        payment_type: 'post_promotion',
        post_id: postId,
        user_id: null, // Anonymous for post promotion
        visitor_id: null, // Can add visitor tracking if needed
        amount: 299,
        method: 'qr',
        receipt_url: paymentProofUrl,
        status: 'pending'
      })
      .select();

    console.log("Payment creation result:", { data, error });

    if (error) {
      console.error("Error creating payment record:", error);
      return { success: false, error: `Database error: ${error.message || error.code || JSON.stringify(error)}` };
    }

    if (!data || data.length === 0) {
      console.error("No rows updated - post not found");
      return { success: false, error: "Post not found or no changes made" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateHomepagePaymentProof:", error);
    return { success: false, error: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
