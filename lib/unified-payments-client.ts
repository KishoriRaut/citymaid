// ============================================================================
// Unified Payment System - Client Side Functions
// ============================================================================

import { 
  PaymentType, 
  getPaymentConfig,
  formatAmount
} from './unified-payments';

// Client-side safe functions that don't import Supabase directly

export interface ClientPaymentRequest {
  id: string;
  type: PaymentType;
  post_id: string;
  user_id?: string;
  visitor_id?: string;
  amount: number;
  status: string;
  payment_proof?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
  posts?: {
    work: string;
    post_type: string;
    contact: string;
    time?: string;
  };
  users?: {
    email: string;
  };
}

// Create payment request via API
export async function createPaymentRequestAPI(
  type: PaymentType,
  postId: string,
  userId?: string | null,
  visitorId?: string | null
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const response = await fetch('/api/create-payment-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        postId,
        userId,
        visitorId
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create payment request' };
    }

    return result;
  } catch (error) {
    console.error('Error creating payment request:', error);
    return { success: false, error: 'Failed to create payment request' };
  }
}

// Get payment request via API
export async function getPaymentRequestAPI(
  requestId: string,
  type: PaymentType
): Promise<{ request?: ClientPaymentRequest; error?: string }> {
  try {
    const response = await fetch(`/api/get-payment-request?id=${requestId}&type=${type}`);
    
    if (!response.ok) {
      return { error: 'Request not found' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting payment request:', error);
    return { error: 'Failed to get payment request' };
  }
}

// Update payment via API
export async function updatePaymentAPI(
  requestId: string,
  type: PaymentType,
  base64String: string,
  fileName: string,
  fileType: string,
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('requestId', requestId);
    formData.append('type', type);
    formData.append('paymentProofBase64', base64String);
    formData.append('fileName', fileName);
    formData.append('fileType', fileType);
    if (transactionId) {
      formData.append('transactionId', transactionId);
    }

    const response = await fetch('/api/unified-payment', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update payment' };
    }

    return result;
  } catch (error) {
    console.error('Error updating payment:', error);
    return { success: false, error: 'Failed to update payment' };
  }
}

// Helper functions
export function getPaymentTypeDisplay(type: PaymentType): string {
  const config = getPaymentConfig(type);
  return config.name;
}

export function getPaymentAmount(type: PaymentType): number {
  const config = getPaymentConfig(type);
  return config.amount;
}

export function formatPaymentAmount(amount: number): string {
  return formatAmount(amount);
}
