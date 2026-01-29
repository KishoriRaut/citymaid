"use server";

import { supabase } from "./supabase";

export interface AdminPayment {
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
  posts?: {
    work: string;
    post_type: string;
    contact: string;
  };
}

export async function getAllAdminPayments(): Promise<{ payments: AdminPayment[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        posts (
          work,
          post_type,
          contact
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return { payments: [], error: error.message };
    }

    return { payments: data as AdminPayment[], error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { payments: [], error: 'Failed to fetch payments' };
  }
}

export async function updateAdminPaymentStatus(
  paymentId: string, 
  status: 'approved' | 'rejected'
): Promise<{ success: boolean, error: string | null }> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to update payment status' };
  }
}

// Create unlock request for contact access
export async function createUnlockRequest(
  postId: string,
  userId: string | null
): Promise<{ success: boolean, requestId?: string, error?: string }> {
  try {
    const visitorId = userId || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('contact_unlock_requests')
      .insert({
        post_id: postId,
        visitor_id: visitorId,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating unlock request:', error);
      return { success: false, error: error.message };
    }

    return { success: true, requestId: data.id };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to create unlock request' };
  }
}
