// Shared types for posts across client and server

export interface Post {
  id: string;
  post_type: "employer" | "employee";
  work: string;
  time: string;
  place: string;
  salary: string;
  contact: string;
  photo_url: string | null;
  status: "pending" | "approved" | "hidden";
  homepage_payment_status: "none" | "pending" | "approved" | "rejected";
  payment_proof: string | null;
  created_at: string;
  // Payment data from joined tables
  payments?: Array<{
    id: string;
    status: string;
    receipt_url: string | null;
    created_at: string;
  }>;
  contact_unlock_requests?: Array<{
    id: string;
    status: string;
    payment_proof: string | null;
    created_at: string;
  }>;
}

export interface PostWithMaskedContact extends Omit<Post, "contact"> {
  contact: string | null; // null if payment not approved, otherwise the actual contact
  can_view_contact: boolean; // Flag indicating if user can view full contact
}
