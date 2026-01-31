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
    photo_url: string | null;
    employee_photo: string | null;
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
          contact,
          photo_url,
          employee_photo
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1000); // Fetch up to 1000 records to include older ones

    if (error) {
      console.error('Error fetching payments:', error);
      return { payments: [], error: error.message };
    }

    console.log(`🔍 Fetched ${data?.length || 0} payment records`);
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
    // First get the post_id for this payment
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('post_id')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      console.error('Error fetching payment:', fetchError);
      return { success: false, error: 'Payment not found' };
    }

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    if (paymentError) {
      console.error('Error updating payment status:', paymentError);
      return { success: false, error: paymentError.message };
    }

    // If approving, also update the post status to 'approved'
    if (status === 'approved') {
      const { error: postError } = await supabase
        .from('posts')
        .update({ status: 'approved' })
        .eq('id', payment.post_id);

      if (postError) {
        console.error('Error updating post status:', postError);
        return { success: false, error: postError.message };
      }

      console.log('✅ Post status updated to approved for post:', payment.post_id);
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
