"use server";

import { supabase } from "./supabase";
import { getServerSession } from "./auth-server";
import { createContactUnlock } from "./contact-unlock";
import { getOrCreateVisitorId } from "./visitor-id";

// Contact unlock request types
export interface ContactUnlockRequest {
  id: string;
  post_id: string;
  visitor_id: string;
  status: 'pending' | 'paid' | 'approved' | 'rejected';
  payment_proof: string | null;
  created_at: string;
  updated_at: string;
  // Additional contact info fields
  user_name?: string | null;
  user_phone?: string | null;
  user_email?: string | null;
  contact_preference?: string | null;
  delivery_status?: string | null;
  delivery_notes?: string | null;
  // Related post data
  posts?: {
    work: string;
    place: string;
    contact: string;
  };
}

// Create a new unlock request (for authenticated users)
export async function createUnlockRequest(
  postId: string,
  userId?: string | null,
  contactInfo?: {
    user_name?: string;
    user_phone?: string;
    user_email?: string;
    contact_preference?: string;
  }
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    // For authenticated users, use user_id, for visitors use visitor_id
    const identifier = userId || getOrCreateVisitorId();
    const identifierField = userId ? 'user_id' : 'visitor_id';

    // Check if user already has a pending/paid request for this post
    const { data: existingRequest } = await supabase
      .from("contact_unlock_requests")
      .select("*")
      .eq("post_id", postId)
      .eq(identifierField, identifier)
      .in("status", ["pending", "paid"])
      .single();

    if (existingRequest) {
      return { success: false, error: "You already have a pending request for this listing" };
    }

    // Create new request
    const requestData: {
      post_id: string;
      status: 'pending';
      user_id?: string;
      visitor_id?: string;
      user_name?: string;
      user_phone?: string;
      user_email?: string;
      contact_preference?: string;
      delivery_status?: string;
    } = {
      post_id: postId,
      status: 'pending',
      delivery_status: 'pending'
    };

    if (userId) {
      requestData.user_id = userId;
    } else {
      requestData.visitor_id = identifier;
    }

    // Add contact information if provided
    if (contactInfo) {
      if (contactInfo.user_name) requestData.user_name = contactInfo.user_name;
      if (contactInfo.user_phone) requestData.user_phone = contactInfo.user_phone;
      if (contactInfo.user_email) requestData.user_email = contactInfo.user_email;
      if (contactInfo.contact_preference) requestData.contact_preference = contactInfo.contact_preference;
    }

    const { data: request, error } = await supabase
      .from("contact_unlock_requests")
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error("Error creating unlock request:", error);
      return { success: false, error: "Failed to create unlock request" };
    }

    return { success: true, requestId: request.id };
  } catch (error) {
    console.error("Error in createUnlockRequest:", error);
    return { success: false, error: "Failed to create unlock request" };
  }
}

// Update unlock request with contact information
export async function updateUnlockRequestContactInfo(
  requestId: string,
  contactInfo: {
    user_name?: string;
    user_phone?: string;
    user_email?: string;
    contact_preference?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Debug - Updating contact info for request:', requestId);
    console.log('🔧 Debug - Contact info:', contactInfo);
    
    const { error } = await supabase
      .from("contact_unlock_requests")
      .update({
        user_name: contactInfo.user_name,
        user_phone: contactInfo.user_phone,
        user_email: contactInfo.user_email,
        contact_preference: contactInfo.contact_preference,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating unlock request contact info:", error);
      return { success: false, error: "Failed to update contact information" };
    }

    console.log('✅ Debug - Contact info updated successfully');
    return { success: true };
  } catch (error) {
    console.error("Error in updateUnlockRequestContactInfo:", error);
    return { success: false, error: "Failed to update contact information" };
  }
}

// Get unlock request by ID
export async function getUnlockRequest(
  requestId: string,
  userId?: string | null
): Promise<{ request?: ContactUnlockRequest; error?: string }> {
  try {
    let query = supabase
      .from("contact_unlock_requests")
      .select("*")
      .eq("id", requestId);

    // If user is not admin, only show their own requests
    if (userId) {
      const session = await getServerSession();
      const isAdmin = session?.email?.endsWith("@citymaid.com") || session?.email === "admin@citymaid.com";
      
      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }
    }

    const { data: request, error } = await query.single();

    if (error) {
      return { error: "Request not found" };
    }

    return { request };
  } catch (error) {
    console.error("Error in getUnlockRequest:", error);
    return { error: "Failed to get unlock request" };
  }
}

// Update request with payment proof
export async function updateRequestPaymentProof(
  requestId: string,
  paymentProofUrl: string,
  visitorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify request belongs to visitor
    const { data: request } = await supabase
      .from("contact_unlock_requests")
      .select("*")
      .eq("id", requestId)
      .eq("visitor_id", visitorId)
      .single();

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== 'pending') {
      return { success: false, error: "Request is not in pending status" };
    }

    // Update request with payment proof
    const { error } = await supabase
      .from("contact_unlock_requests")
      .update({
        payment_proof: paymentProofUrl,
        status: 'paid'
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating payment proof:", error);
      return { success: false, error: "Failed to update payment proof" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateRequestPaymentProof:", error);
    return { success: false, error: "Failed to update payment proof" };
  }
}

// Get all requests for admin dashboard
export async function getAllUnlockRequests(
  status?: 'pending' | 'paid' | 'approved' | 'rejected'
): Promise<{ requests?: ContactUnlockRequest[]; error?: string }> {
  try {
    let query = supabase
      .from("contact_unlock_requests")
      .select(`
        *,
        posts(work, place, contact)
      `)
      .order("created_at", { ascending: false })
      .limit(1000); // Fetch up to 1000 records to include older ones

    if (status) {
      query = query.eq("status", status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Error getting unlock requests:", error);
      return { error: "Failed to get unlock requests" };
    }

    console.log(`🔍 Fetched ${requests?.length || 0} unlock request records`);
    return { requests: requests || [] };
  } catch (error) {
    console.error("Error in getAllUnlockRequests:", error);
    return { error: "Failed to get unlock requests" };
  }
}

// Approve request (admin only)
export async function approveUnlockRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get request details
    const { data: request, error: fetchError } = await supabase
      .from("contact_unlock_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== 'paid') {
      return { success: false, error: "Request must be paid before approval" };
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("contact_unlock_requests")
      .update({ status: 'approved' })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error approving request:", updateError);
      return { success: false, error: "Failed to approve request" };
    }

    // Create contact unlock record
    await createContactUnlock(
      request.post_id,
      request.visitor_id,
      'payment_proof',
      0, // Amount can be configured later
      requestId
    );

    return { success: true };
  } catch (error) {
    console.error("Error in approveUnlockRequest:", error);
    return { success: false, error: "Failed to approve request" };
  }
}

// Reject request (admin only)
export async function rejectUnlockRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("contact_unlock_requests")
      .update({ status: 'rejected' })
      .eq("id", requestId);

    if (error) {
      console.error("Error rejecting request:", error);
      return { success: false, error: "Failed to reject request" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in rejectUnlockRequest:", error);
    return { success: false, error: "Failed to reject request" };
  }
}

// Update request with payment proof (for payment page)
export async function updateUnlockRequestPayment(
  requestId: string,
  paymentProofFile: File
): Promise<{ success: boolean; error?: string }> {
  try {
    // Upload payment proof to Supabase Storage
    const fileName = `payment-proof-${requestId}-${Date.now()}.${paymentProofFile.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, paymentProofFile);

    if (uploadError) {
      console.error("Error uploading payment proof:", uploadError);
      return { success: false, error: "Failed to upload payment proof" };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    // Update request with payment proof and transaction ID
    const { error: updateError } = await supabase
      .from("contact_unlock_requests")
      .update({
        payment_proof: publicUrl,
        status: 'paid'
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating payment proof:", updateError);
      return { success: false, error: "Failed to update payment proof" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUnlockRequestPayment:", error);
    return { success: false, error: "Failed to update payment proof" };
  }
}

// Get unlock request by ID (for public view)
export async function getUnlockRequestById(
  requestId: string
): Promise<{ request?: ContactUnlockRequest & { posts?: { title: string; contact: string; description?: string }; users?: { email: string } }; error?: string }> {
  try {
    const { data: request, error } = await supabase
      .from("contact_unlock_requests")
      .select(`
        *,
        posts(title, contact, description),
        users(email)
      `)
      .eq("id", requestId)
      .single();

    if (error) {
      return { error: "Request not found" };
    }

    return { request };
  } catch (error) {
    console.error("Error in getUnlockRequestById:", error);
    return { error: "Failed to get unlock request" };
  }
}

// Check if visitor can view contact based on approved requests
export async function canViewContactViaRequest(
  postId: string,
  visitorId: string
): Promise<boolean> {
  if (!visitorId) return false;

  try {
    const { data: request } = await supabase
      .from("contact_unlock_requests")
      .select("*")
      .eq("post_id", postId)
      .eq("visitor_id", visitorId)
      .eq("status", 'approved')
      .single();

    return !!request;
  } catch (error) {
    console.error("Error checking contact view permission:", error);
    return false;
  }
}
