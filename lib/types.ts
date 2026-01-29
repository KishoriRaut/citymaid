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
  created_at: string;
}

export interface PostWithMaskedContact extends Omit<Post, "contact"> {
  contact: string | null; // null if payment not approved, otherwise the actual contact
  can_view_contact: boolean; // Flag indicating if user can view full contact
}
