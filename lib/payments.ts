"use server";

import { supabase } from "./supabase";
import { CONTACT_UNLOCK_PRICE } from "./pricing";
import { createContactUnlock } from "./contact-unlock";
import { getServerSession } from "./auth-server";

export interface Payment {
  id: string;
  post_id: string;
  visitor_id: string | null;
  amount: number;
  method: "qr" | "esewa" | "bank";
  reference_id: string | null;
  customer_name: string | null;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// Create payment (public)
export async function createPayment(payment: {
  post_id: string;
  visitor_id?: string;
  method: "qr" | "esewa" | "bank";
  reference_id?: string;
  customer_name?: string;
  receipt_url?: string;
  amount?: number;
}) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        ...payment,
        status: "pending",
        amount: payment.amount || CONTACT_UNLOCK_PRICE,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      return { payment: null, error: error.message };
    }

    // If user is authenticated, create contact unlock record
    const session = await getServerSession();
    if (session?.id && payment.post_id) {
      const unlockResult = await createContactUnlock(
        payment.post_id,
        session.id,
        payment.method,
        payment.amount || CONTACT_UNLOCK_PRICE,
        payment.reference_id
      );
      
      if (!unlockResult.success) {
        console.error("Error creating contact unlock:", unlockResult.error);
        // Don't fail the payment if unlock creation fails, just log it
      }
    }

    return { payment: data as Payment, error: null };
  } catch (error) {
    console.error("Error in createPayment:", error);
    return { payment: null, error: "Failed to create payment" };
  }
}

// Get all payments (admin only)
export async function getAllPayments(filters?: {
  status?: "pending" | "approved" | "rejected";
  post_id?: string;
}) {
  try {
    // Select payments with related post data
    // Note: Removed posts.status from nested select to avoid ambiguity
    // We only need post details, not post status for payments management
    let query = supabase
      .from("payments")
      .select(`
        id,
        post_id,
        visitor_id,
        amount,
        method,
        reference_id,
        customer_name,
        receipt_url,
        status,
        created_at,
        posts (
          id,
          post_type,
          work,
          "time",
          place,
          salary,
          contact,
          photo_url,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    // Filter by payment status
    // Since we removed posts.status from nested select, this is now unambiguous
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.post_id) {
      query = query.eq("post_id", filters.post_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      return { payments: [], error: error.message };
    }

    return { payments: (data || []) as Payment[], error: null };
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return { payments: [], error: "Failed to fetch payments" };
  }
}

// Update payment status (admin only)
export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    // First get the payment details to create unlock record if approved
    const { data: paymentData, error: fetchError } = await supabase
      .from("payments")
      .select("post_id, visitor_id, method, amount, reference_id")
      .eq("id", paymentId)
      .single();

    if (fetchError) {
      console.error("Error fetching payment details:", fetchError);
      return { payment: null, error: fetchError.message };
    }

    // Update payment status
    const { data, error } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment:", error);
      return { payment: null, error: error.message };
    }

    // If payment is approved, create contact unlock record
    if (status === "approved" && paymentData?.post_id) {
      // Try to get user_id from visitor_id first (for anonymous users)
      let userId = paymentData.visitor_id;
      let isVisitorId = false;
      
      // If no visitor_id, try to find authenticated user by other means
      if (!userId) {
        // For authenticated users, we might need to look up their user_id
        // This could be enhanced based on your authentication system
        const session = await getServerSession();
        userId = session?.id;
        isVisitorId = false;
      } else {
        isVisitorId = true; // This is a visitor_id, not a user_id
      }
      
      if (userId) {
        const unlockResult = await createContactUnlock(
          paymentData.post_id,
          userId,
          paymentData.method,
          paymentData.amount,
          paymentData.reference_id,
          isVisitorId
        );
        
        if (!unlockResult.success) {
          console.error("Error creating contact unlock:", unlockResult.error);
          // Don't fail the payment update if unlock creation fails, just log it
        }
      }
    }

    return { payment: data as Payment, error: null };
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    return { payment: null, error: "Failed to update payment" };
  }
}

// Check if payment is approved for a post (to show contact)
export async function checkPaymentApproved(postId: string, visitorId?: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("id, visitor_id")
      .eq("post_id", postId)
      .eq("status", "approved")
      .limit(1);

    if (error) {
      console.error("Error checking payment:", error);
      return false;
    }

    // If visitor_id provided, check for that specific visitor
    if (visitorId) {
      const visitorPayment = data?.find((p) => p.visitor_id === visitorId);
      return !!visitorPayment;
    }

    // Otherwise, check if any payment is approved (for general contact visibility)
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Error in checkPaymentApproved:", error);
    return false;
  }
}
