"use server";

import { supabase } from "./supabase";
import { CONTACT_UNLOCK_PRICE } from "./pricing";
import { createContactUnlock } from "./contact-unlock";
import { getServerSession } from "./auth-server";
import { getCurrentPhoneUser } from "./phone-auth";

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
export async function createPayment(paymentData: {
  post_id: string;
  visitor_id?: string;
  amount: number;
  method: string;
  reference_id?: string;
  customer_name?: string;
  receipt_url?: string;
}): Promise<{ payment: Payment | null; error?: string }> {
  try {
    // Get current authenticated user (phone auth)
    const userSession = await getCurrentPhoneUser();
    
    if (!userSession || !userSession.user) {
      return { payment: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("payments")
      .insert({
        ...paymentData,
        visitor_id: userSession.user.id,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      return { payment: null, error: error.message };
    }

    // If user is authenticated, create contact unlock record
    const session = await getServerSession();
    if (session?.id && paymentData.post_id) {
      const unlockResult = await createContactUnlock(
        paymentData.post_id,
        session.id,
        paymentData.method,
        paymentData.amount || CONTACT_UNLOCK_PRICE,
        paymentData.reference_id || undefined
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

// Update payment status (admin only) - now uses atomic function
export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    if (status === "approved") {
      // Use atomic function for payment approval + unlock creation
      const { data, error } = await supabase
        .rpc("approve_payment_and_unlock", { payment_id_param: paymentId })
        .single();

      if (error) {
        console.error("Error in atomic payment approval:", error);
        return { payment: null, error: error.message };
      }

      // Get the updated payment record
      const { data: paymentData, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (fetchError) {
        console.error("Error fetching updated payment:", fetchError);
        return { payment: null, error: fetchError.message };
      }

      return { payment: paymentData as Payment, error: null };
    } else {
      // For rejected payments, use simple update
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

      return { payment: data as Payment, error: null };
    }
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
