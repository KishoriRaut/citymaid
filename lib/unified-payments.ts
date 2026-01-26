// ============================================================================
// Unified Payment System - Status Utility & Core Functions
// ============================================================================

// Payment types supported by the unified system
export type PaymentType = 'post_promotion' | 'contact_unlock';

// Unified status flow for all payment types
export type PaymentStatus = 'pending' | 'paid' | 'approved' | 'rejected' | 'active' | 'expired';

// Unified payment request interface
export interface UnifiedPaymentRequest {
  id: string;
  type: PaymentType;
  post_id?: string;
  visitor_id?: string;
  user_id?: string;
  amount: number;
  status: PaymentStatus;
  payment_proof?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  // Type-specific data
  posts?: {
    work?: string;
    title?: string;
    contact?: string;
    time?: string;
    description?: string;
  };
  users?: {
    email: string;
  };
}

// ============================================================================
// Status Utility Functions
// ============================================================================

export const PaymentStatusFlow = {
  // Valid status transitions
  transitions: {
    pending: ['paid', 'rejected'] as PaymentStatus[],
    paid: ['approved', 'rejected'] as PaymentStatus[],
    approved: ['active', 'rejected'] as PaymentStatus[],
    active: ['expired'] as PaymentStatus[],
    rejected: [] as PaymentStatus[], // Terminal state
    expired: [] as PaymentStatus[]   // Terminal state
  } as Record<PaymentStatus, PaymentStatus[]>,

  // Check if status transition is valid
  isValidTransition: (from: PaymentStatus, to: PaymentStatus): boolean => {
    return PaymentStatusFlow.transitions[from]?.includes(to) || false;
  },

  // Get next possible statuses
  getNextStatuses: (current: PaymentStatus): PaymentStatus[] => {
    return PaymentStatusFlow.transitions[current] || [];
  },

  // Get display text for status
  getStatusDisplay: (status: PaymentStatus): string => {
    const statusMap = {
      pending: 'Pending Payment',
      paid: 'Payment Received',
      approved: 'Approved',
      rejected: 'Rejected',
      active: 'Active',
      expired: 'Expired'
    };
    return statusMap[status] || status;
  },

  // Get status color for UI
  getStatusColor: (status: PaymentStatus): string => {
    const colorMap = {
      pending: 'yellow',
      paid: 'blue',
      approved: 'green',
      rejected: 'red',
      active: 'green',
      expired: 'gray'
    };
    return colorMap[status] || 'gray';
  }
};

// ============================================================================
// Payment Type Configuration
// ============================================================================

export const PaymentTypeConfig = {
  post_promotion: {
    name: 'Homepage Post',
    amount: 299,
    duration: 30, // days
    description: 'Publish your post on homepage for 30 days',
    successMessage: 'Your post will be published on homepage after admin approval'
  },
  contact_unlock: {
    name: 'Contact Unlock',
    amount: 299,
    duration: null, // permanent
    description: 'Unlock contact information for this job',
    successMessage: 'Contact information will be available after admin approval'
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

// Get payment configuration by type
export function getPaymentConfig(type: PaymentType) {
  return PaymentTypeConfig[type];
}

// Validate payment type
export function isValidPaymentType(type: string): type is PaymentType {
  return ['post_promotion', 'contact_unlock'].includes(type);
}

// Format amount with currency
export function formatAmount(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

// Calculate expiry date for post promotion
export function calculateExpiryDate(days: number): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

// Check if post promotion is still active
export function isPromotionActive(created_at: string, durationDays: number): boolean {
  const created = new Date(created_at);
  const expiry = new Date(created);
  expiry.setDate(expiry.getDate() + durationDays);
  return new Date() < expiry;
}
