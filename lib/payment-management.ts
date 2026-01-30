"use server";

import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";

// Approve payment for a post
export async function approvePayment(postId: string) {
  try {
    const { error } = await supabase
      .from("posts")
      .update({ homepage_payment_status: "approved" })
      .eq("id", postId);

    if (error) {
      console.error("Error approving payment:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error approving payment:", error);
    return { success: false, error: "Failed to approve payment" };
  }
}

// Reject payment for a post with reason
export async function rejectPayment(
  paymentId: string, 
  reason: string, 
  type: "homepage" | "contact_unlock" = "contact_unlock"
) {
  try {
    if (type === "homepage") {
      // Handle homepage payment rejection
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentId);

      if (error) throw error;
    } else {
      // Handle contact unlock payment rejection
      const { error } = await supabase
        .from("contact_unlock_requests")
        .update({ 
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentId);

      if (error) throw error;
    }

    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { success: false, error: "Failed to reject payment" };
  }
}

// Enhanced approval function that checks payment status first
export async function approvePostWithPaymentCheck(postId: string) {
  try {
    // First check the payment status
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("homepage_payment_status")
      .eq("id", postId)
      .single();

    if (fetchError) {
      return { success: false, error: "Failed to check payment status" };
    }

    // If payment is not approved, don't allow post approval
    if (post.homepage_payment_status !== "approved") {
      return { 
        success: false, 
        error: "Cannot approve post: Payment must be approved first" 
      };
    }

    // Payment is approved, proceed with post approval
    const { error: updateError } = await supabase
      .from("posts")
      .update({ status: "approved" })
      .eq("id", postId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error approving post:", error);
    return { success: false, error: "Failed to approve post" };
  }
}
