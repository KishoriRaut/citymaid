// ============================================================================
// Unified Payment System - Backend Functions
// ============================================================================

import { supabase } from '@/lib/supabase';
import { uploadPaymentReceiptServer } from '@/lib/storage-server';
import { 
  PaymentType, 
  PaymentStatus, 
  UnifiedPaymentRequest,
  getPaymentConfig,
  isValidPaymentType
} from './unified-payments';

// Server-side check to prevent client-side execution
if (typeof window !== 'undefined') {
  throw new Error('Unified payment functions can only be used on the server side');
}

// ============================================================================
// Create Payment Request
// ============================================================================

export async function createUnifiedPaymentRequest(
  type: PaymentType,
  postId?: string,
  userId?: string | null,
  visitorId?: string | null
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    console.log('🔧 UNIFIED - Creating payment request:', { type, postId, userId, visitorId });

    // Validate payment type
    if (!isValidPaymentType(type)) {
      return { success: false, error: "Invalid payment type" };
    }

    // Get configuration
    const config = getPaymentConfig(type);
    
    // Determine user identifier (visitor or authenticated user)
    const identifier = visitorId || userId;
    if (!identifier) {
      return { success: false, error: "User identification required" };
    }

    return createPaymentRequestInDatabase(type, postId, userId || null, visitorId || null, config.amount);
  } catch (error) {
    console.error("❌ UNIFIED - Error creating payment request:", error);
    return { success: false, error: "Failed to create payment request" };
  }
}

// ============================================================================
// Database Operations
// ============================================================================

async function createPaymentRequestInDatabase(
  type: PaymentType,
  postId: string | undefined,
  userId: string | null,
  visitorId: string | null,
  amount: number
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    // Check for existing pending/paid requests
    const existingRequest = await getExistingRequest(type, postId, userId, visitorId);
    if (existingRequest) {
      const config = getPaymentConfig(type);
      return { 
        success: false, 
        error: `You already have a pending request for this ${config.name.toLowerCase()}` 
      };
    }

    // Create payment request based on type
    if (type === 'post_promotion') {
      return createPostPromotionRequest(postId!, userId, visitorId, amount);
    } else if (type === 'contact_unlock') {
      return createContactUnlockRequest(postId!, userId, visitorId, amount);
    }

    return { success: false, error: "Unsupported payment type" };
  } catch (error) {
    console.error("❌ UNIFIED - Database error:", error);
    return { success: false, error: "Database operation failed" };
  }
}

async function getExistingRequest(
  type: PaymentType,
  postId: string | undefined,
  userId: string | null,
  visitorId: string | null
): Promise<boolean> {
  try {
    if (type === 'post_promotion' && postId) {
      // Check posts table for existing homepage payment
      const { data } = await supabase
        .from('posts')
        .select('homepage_payment_status')
        .eq('id', postId)
        .in('homepage_payment_status', ['pending', 'paid'])
        .single();
      
      return !!data;
    } else if (type === 'contact_unlock' && postId && visitorId) {
      // Check contact_unlock_requests table
      const { data } = await supabase
        .from('contact_unlock_requests')
        .select('id')
        .eq('post_id', postId)
        .eq('visitor_id', visitorId)
        .in('status', ['pending', 'paid'])
        .single();
      
      return !!data;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking existing request:", error);
    return false;
  }
}

async function createPostPromotionRequest(
  postId: string,
  userId: string | null,
  visitorId: string | null,
  amount: number
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ 
        homepage_payment_status: 'pending'
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error("❌ UNIFIED - Error creating post promotion request:", error);
      return { success: false, error: "Failed to create promotion request" };
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        post_id: postId,
        visitor_id: visitorId,
        amount,
        method: 'bank_transfer', // Default method
        status: 'pending'
      });

    if (paymentError) {
      console.error("❌ UNIFIED - Error creating payment record:", paymentError);
      // Don't fail the whole operation if payment record fails
    }

    console.log('✅ UNIFIED - Post promotion request created:', postId);
    return { success: true, requestId: postId };
  } catch (error) {
    console.error("❌ UNIFIED - Error in createPostPromotionRequest:", error);
    return { success: false, error: "Failed to create promotion request" };
  }
}

async function createContactUnlockRequest(
  postId: string,
  userId: string | null,
  visitorId: string | null,
  amount: number
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const requestData = {
      post_id: postId,
      status: 'pending' as const,
      visitor_id: visitorId
    };

    const { data, error } = await supabase
      .from('contact_unlock_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error("❌ UNIFIED - Error creating unlock request:", error);
      return { success: false, error: "Failed to create unlock request" };
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        post_id: postId,
        visitor_id: visitorId,
        amount,
        payment_type: 'contact_unlock',
        status: 'pending'
      });

    if (paymentError) {
      console.error("❌ UNIFIED - Error creating payment record:", paymentError);
      // Don't fail the whole operation if payment record fails
    }

    console.log('✅ UNIFIED - Contact unlock request created:', data.id);
    return { success: true, requestId: data.id };
  } catch (error) {
    console.error("❌ UNIFIED - Error in createContactUnlockRequest:", error);
    return { success: false, error: "Failed to create unlock request" };
  }
}

// ============================================================================
// Get Payment Request by ID
// ============================================================================

export async function getUnifiedPaymentRequest(
  requestId: string,
  type: PaymentType,
  userId?: string | null
): Promise<{ request?: UnifiedPaymentRequest; error?: string }> {
  try {
    console.log('🔧 UNIFIED - Getting payment request:', { requestId, type, userId });

    if (type === 'post_promotion') {
      return getPostPromotionRequest(requestId);
    } else if (type === 'contact_unlock') {
      return getContactUnlockRequest(requestId);
    }

    return { error: "Invalid payment type" };
  } catch (error) {
    console.error("❌ UNIFIED - Error getting payment request:", error);
    return { error: "Failed to get payment request" };
  }
}

async function getPostPromotionRequest(
  postId: string
): Promise<{ request?: UnifiedPaymentRequest; error?: string }> {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        users(email)
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return { error: "Post not found" };
    }

    const config = getPaymentConfig('post_promotion');
    
    const request: UnifiedPaymentRequest = {
      id: post.id,
      type: 'post_promotion',
      post_id: post.id,
      user_id: post.user_id,
      visitor_id: undefined,
      amount: config.amount,
      status: post.homepage_payment_status as PaymentStatus,
      created_at: post.created_at,
      updated_at: post.updated_at,
      posts: {
        work: post.work,
        title: post.work, // Use work as title for consistency
        contact: post.contact,
        time: post.time
      },
      users: post.users || undefined
    };

    return { request };
  } catch (error) {
    console.error("❌ UNIFIED - Error getting post promotion request:", error);
    return { error: "Failed to get promotion request" };
  }
}

async function getContactUnlockRequest(
  requestId: string
): Promise<{ request?: UnifiedPaymentRequest; error?: string }> {
  try {
    const query = supabase
      .from('contact_unlock_requests')
      .select(`
        id,
        post_id,
        visitor_id,
        status,
        payment_proof,
        transaction_id,
        created_at,
        updated_at
      `)
      .eq('id', requestId);

    // For now, skip admin filtering - will be handled at higher level
    const { data: request, error } = await query.single();

    if (error || !request) {
      return { error: "Request not found" };
    }

    const config = getPaymentConfig('contact_unlock');
    
    const unifiedRequest: UnifiedPaymentRequest = {
      id: request.id,
      type: 'contact_unlock',
      post_id: request.post_id,
      visitor_id: request.visitor_id,
      amount: config.amount,
      status: request.status as PaymentStatus,
      payment_proof: request.payment_proof || undefined,
      transaction_id: request.transaction_id || undefined,
      created_at: request.created_at,
      updated_at: request.updated_at || undefined,
      posts: undefined, // Will be populated separately if needed
      users: undefined   // Will be populated separately if needed
    };

    return { request: unifiedRequest };
  } catch (error) {
    console.error("❌ UNIFIED - Error getting contact unlock request:", error);
    return { error: "Failed to get unlock request" };
  }
}

// ============================================================================
// Update Payment with Proof
// ============================================================================

export async function updateUnifiedPayment(
  requestId: string,
  type: PaymentType,
  base64String: string,
  fileName: string,
  fileType: string,
  transactionId?: string,
  userName?: string,
  userPhone?: string,
  userEmail?: string,
  contactPreference?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 UNIFIED - Updating payment:', { requestId, type, fileName, transactionId });

    let paymentProof: string;

    // If we have a base64 file, upload it to Supabase Storage
    if (base64String && fileName && fileType) {
      // Convert base64 back to File for upload
      const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: fileType });
      const file = new File([blob], fileName, { type: fileType });
      
      // Upload to Supabase Storage
      const uploadResult = await uploadPaymentReceiptServer(file);
      
      if (uploadResult.error || !uploadResult.url) {
        console.error('❌ UNIFIED - Failed to upload receipt:', uploadResult.error);
        return { success: false, error: `Failed to upload receipt: ${uploadResult.error}` };
      }
      
      paymentProof = uploadResult.url;
      console.log('✅ UNIFIED - Receipt uploaded to storage:', paymentProof);
    } else if (transactionId) {
      // Fallback to transaction ID placeholder
      paymentProof = `transaction_${requestId}_${transactionId}_${Date.now()}`;
      console.log('📝 UNIFIED - Using transaction ID placeholder:', paymentProof);
    } else {
      return { success: false, error: 'Either payment proof file or transaction ID is required' };
    }

    if (type === 'post_promotion') {
      return updatePostPromotionPayment(requestId, paymentProof);
    } else if (type === 'contact_unlock') {
      return updateContactUnlockPayment(requestId, paymentProof, userName, userPhone, userEmail, contactPreference);
    }

    return { success: false, error: "Invalid payment type" };
  } catch (error) {
    console.error("❌ UNIFIED - Error updating payment:", error);
    return { success: false, error: "Failed to update payment" };
  }
}

async function updatePostPromotionPayment(
  postId: string,
  paymentProof: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ 
        homepage_payment_status: 'paid'
      })
      .eq('id', postId);

    if (error) {
      console.error("❌ UNIFIED - Error updating post promotion:", error);
      return { success: false, error: "Failed to update promotion" };
    }

    // Update payment record - match actual table structure
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        receipt_url: paymentProof,
        status: 'paid'
      })
      .eq('post_id', postId);

    if (paymentError) {
      console.error("❌ UNIFIED - Error updating payment record:", paymentError);
      // Don't fail the operation if payment record update fails
    }

    console.log('✅ UNIFIED - Post promotion payment updated:', postId);
    return { success: true };
  } catch (error) {
    console.error("❌ UNIFIED - Error in updatePostPromotionPayment:", error);
    return { success: false, error: "Failed to update promotion" };
  }
}

async function updateContactUnlockPayment(
  requestId: string,
  paymentProof: string,
  userName?: string,
  userPhone?: string,
  userEmail?: string,
  contactPreference?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 UNIFIED - Looking for unlock request with identifier:', requestId);
    
    // First try to find by ID
    let { data: unlockRequest, error: fetchError } = await supabase
      .from('contact_unlock_requests')
      .select('id, post_id, status')
      .eq('id', requestId)
      .single();
    
    // If not found by ID, try by visitor_id
    if (fetchError || !unlockRequest) {
      console.log('🔍 UNIFIED - Trying to find by visitor_id...');
      const { data: requestByVisitor, error: visitorError } = await supabase
        .from('contact_unlock_requests')
        .select('id, post_id, status')
        .eq('visitor_id', requestId)
        .eq('status', 'pending')
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
      console.log('🔍 UNIFIED - Search by visitor_id result:', { requestByVisitor, visitorError: visitorError?.message });
      
      if (visitorError || !requestByVisitor) {
        console.error("❌ UNIFIED - Could not find unlock request by ID or visitor_id");
        return { success: false, error: "Failed to find unlock request" };
      }
      
      unlockRequest = requestByVisitor;
      console.log('🔍 UNIFIED - Found request by visitor_id, actual ID:', unlockRequest.id);
    }
    
    console.log('🔍 UNIFIED - Found request:', unlockRequest);
    
    // Use the appropriate field to update - if ID is null, use visitor_id
    const updateField = unlockRequest.id ? 'id' : 'visitor_id';
    const updateValue = unlockRequest.id || requestId;
    
    console.log('🔍 UNIFIED - Updating using field:', updateField, 'with value:', updateValue);
    
    // Update the unlock request with contact information
    const updateData: any = {
      payment_proof: paymentProof,
      status: 'paid'
    };

    // Add contact information if provided
    if (userName) updateData.user_name = userName;
    if (userPhone) updateData.user_phone = userPhone;
    if (userEmail) updateData.user_email = userEmail;
    if (contactPreference) updateData.contact_preference = contactPreference;

    const { error } = await supabase
      .from('contact_unlock_requests')
      .update(updateData)
      .eq(updateField, updateValue);

    if (error) {
      console.error("❌ UNIFIED - Error updating unlock request:", error);
      console.error("❌ UNIFIED - Update data:", updateData);
      console.error("❌ UNIFIED - Update field:", updateField, "Update value:", updateValue);
      return { success: false, error: `Failed to update unlock request: ${error.message}` };
    }

    // Update payment record - match actual table structure
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        receipt_url: paymentProof,
        status: 'paid'
      })
      .eq('post_id', unlockRequest.post_id);

    if (paymentError) {
      console.error("❌ UNIFIED - Error updating payment record:", paymentError);
      // Don't fail the operation if payment record update fails
    }

    console.log('✅ UNIFIED - Contact unlock payment updated:', requestId);
    return { success: true };
  } catch (error) {
    console.error("❌ UNIFIED - Error in updateContactUnlockPayment:", error);
    return { success: false, error: "Failed to update unlock request" };
  }
}
