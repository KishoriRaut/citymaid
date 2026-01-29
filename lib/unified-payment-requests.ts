// ============================================================================
// Unified Payment System - Backend Functions
// ============================================================================

import { supabase } from '@/lib/supabase';
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

// ============================================================================
// Get Multiple Payment Requests
// ============================================================================

export async function getUnifiedPaymentRequests(
  filters?: {
    post_id?: string;
    type?: 'post_promotion' | 'contact_unlock';
    visitor_id?: string;
  }
): Promise<{ success: boolean; requests?: UnifiedPaymentRequest[]; error?: string }> {
  try {
    console.log('🔧 UNIFIED - Getting payment requests with filters:', filters);

    const requests: UnifiedPaymentRequest[] = [];

    // Get contact unlock requests
    if (!filters?.type || filters.type === 'contact_unlock') {
      let query = supabase
        .from('contact_unlock_requests')
        .select(`
          *,
          posts(title, work, place, salary, post_type)
        `);

      if (filters?.post_id) {
        query = query.eq('post_id', filters.post_id);
      }
      if (filters?.visitor_id) {
        query = query.eq('visitor_id', filters.visitor_id);
      }

      const { data: unlockRequests, error: unlockError } = await query;

      if (!unlockError && unlockRequests) {
        const unlockPaymentRequests: UnifiedPaymentRequest[] = unlockRequests.map(req => ({
          id: req.id,
          type: 'contact_unlock',
          post_id: req.post_id,
          user_id: undefined,
          visitor_id: req.visitor_id,
          amount: getPaymentConfig('contact_unlock').amount,
          status: req.status as PaymentStatus,
          created_at: req.created_at,
          updated_at: req.updated_at,
          payment_proof: req.payment_proof || undefined,
          posts: req.posts
        }));
        requests.push(...unlockPaymentRequests);
      }
    }

    // Get post promotion requests
    if (!filters?.type || filters.type === 'post_promotion') {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users(email)
        `)
        .eq('is_promoted', true);

      if (filters?.post_id) {
        query = query.eq('id', filters.post_id);
      }

      const { data: promotedPosts, error: promoError } = await query;

      if (!promoError && promotedPosts) {
        const promoPaymentRequests: UnifiedPaymentRequest[] = promotedPosts.map(post => ({
          id: post.id,
          type: 'post_promotion',
          post_id: post.id,
          user_id: post.user_id,
          visitor_id: undefined,
          amount: getPaymentConfig('post_promotion').amount,
          status: 'approved' as PaymentStatus,
          created_at: post.created_at,
          updated_at: post.updated_at,
          payment_proof: undefined,
          users: post.users
        }));
        requests.push(...promoPaymentRequests);
      }
    }

    console.log('✅ UNIFIED - Successfully fetched requests:', requests.length);
    return { success: true, requests };
  } catch (error) {
    console.error('❌ UNIFIED - Error getting payment requests:', error);
    return { success: false, error: 'Failed to get payment requests' };
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
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 UNIFIED - Updating payment:', { requestId, type, fileName, transactionId });

    // Create data URL
    const dataUrl = `data:${fileType};base64,${base64String}`;
    const paymentProof = transactionId 
      ? `${dataUrl}?tx=${encodeURIComponent(transactionId)}`
      : dataUrl;

    if (type === 'post_promotion') {
      return updatePostPromotionPayment(requestId, paymentProof);
    } else if (type === 'contact_unlock') {
      return updateContactUnlockPayment(requestId, paymentProof);
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
  paymentProof: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the post_id from the unlock request
    const { data: unlockRequest, error: fetchError } = await supabase
      .from('contact_unlock_requests')
      .select('post_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !unlockRequest) {
      console.error("❌ UNIFIED - Error fetching unlock request:", fetchError);
      return { success: false, error: "Failed to find unlock request" };
    }

    // Update the unlock request
    const { error } = await supabase
      .from('contact_unlock_requests')
      .update({ 
        payment_proof: paymentProof,
        status: 'paid'
      })
      .eq('id', requestId);

    if (error) {
      console.error("❌ UNIFIED - Error updating unlock request:", error);
      return { success: false, error: "Failed to update unlock request" };
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
