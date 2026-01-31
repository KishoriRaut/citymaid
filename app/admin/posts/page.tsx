"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllPosts, updatePostStatus, deletePost, updatePost } from "@/lib/posts";
import { usePaymentInfo } from "@/lib/payment-utils";
import { approvePayment, rejectPayment, approvePostWithPaymentCheck } from "@/lib/payment-management";
import type { Post } from "@/lib/types";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";
import { PaymentReceiptModal } from "@/components/admin/PaymentReceiptModal";
import { MissingReceiptModal } from "@/components/admin/MissingReceiptModal";
import { TestPaymentReceiptUpload } from "@/components/admin/TestPaymentReceiptUpload";

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");
  
  // Payment modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMissingReceiptModalOpen, setIsMissingReceiptModalOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { posts: fetchedPosts, error: fetchError } = await getAllPosts({
        status: filter === "all" ? undefined : filter,
      });

      if (fetchError) {
        setError(fetchError);
        setIsLoading(false);
        return;
      }

      setPosts(fetchedPosts);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts");
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [filter, loadPosts]);

  const handleStatusChange = async (postId: string, newStatus: "approved" | "hidden") => {
    try {
      const { error: updateError } = await updatePostStatus(postId, newStatus);
      if (updateError) {
        alert(`Error: ${updateError}`);
        return;
      }
      loadPosts();
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post");
    }
  };

  // Payment management functions
  const handleViewReceipt = (post: Post) => {
    setSelectedPost(post);
    setIsPaymentModalOpen(true);
  };

  const handleMissingReceipt = (post: Post) => {
    setSelectedPost(post);
    setIsMissingReceiptModalOpen(true);
  };

  const handleApprovePayment = async () => {
    if (!selectedPost) return;
    
    const { success, error } = await approvePayment(selectedPost.id);
    if (error) {
      alert(`Error approving payment: ${error}`);
      return;
    }
    
    loadPosts();
    alert("Payment approved successfully!");
  };

  const handleRejectPayment = async (reason: string) => {
    if (!selectedPost) return;
    
    const { success, error } = await rejectPayment(selectedPost.id, reason);
    if (error) {
      alert(`Error rejecting payment: ${error}`);
      return;
    }
    
    loadPosts();
    alert("Payment rejected successfully!");
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const { error: deleteError } = await deletePost(postId);
      if (deleteError) {
        alert(`Error: ${deleteError}`);
        return;
      }
      loadPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  const handleEdit = async (postId: string, updates: {
    post_type?: "employer" | "employee";
    work?: string;
    time?: string;
    place?: string;
    salary?: string;
    contact?: string;
    photo_url?: string | null;
    status?: "pending" | "approved" | "hidden";
  }) => {
    try {
      const { error: updateError } = await updatePost(postId, updates);
      if (updateError) {
        alert(`Error: ${updateError}`);
        return;
      }
      loadPosts();
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Posts Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all marketplace posts</p>
          </div>
          <Button onClick={() => router.push(appConfig.routes.admin)} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 border rounded-md p-1 bg-background w-fit">
          {(["all", "pending", "approved", "hidden"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {/* Test Upload Component */}
        <TestPaymentReceiptUpload />

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No posts found</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onViewReceipt={handleViewReceipt}
                onMissingReceipt={handleMissingReceipt}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Receipt Modal */}
      {selectedPost && (
        <PaymentReceiptModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onApprovePayment={handleApprovePayment}
          onRejectPayment={handleRejectPayment}
        />
      )}

      {/* Missing Receipt Modal */}
      {selectedPost && (
        <MissingReceiptModal
          isOpen={isMissingReceiptModalOpen}
          onClose={() => {
            setIsMissingReceiptModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}
    </div>
  );
}

function PostCard({
  post,
  onStatusChange,
  onDelete,
  onEdit,
  onViewReceipt,
  onMissingReceipt,
}: {
  post: Post;
  onStatusChange: (postId: string, status: "approved" | "hidden") => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, updates: {
    post_type?: "employer" | "employee";
    work?: string;
    time?: string;
    place?: string;
    salary?: string;
    contact?: string;
    photo_url?: string | null;
    employee_photo?: string | null;
    status?: "pending" | "approved" | "hidden";
  }) => void;
  onViewReceipt: (post: Post) => void;
  onMissingReceipt: (post: Post) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    post_type: post.post_type,
    work: post.work,
    time: post.time,
    place: post.place,
    salary: post.salary,
    contact: post.contact,
    photo_url: post.photo_url || "",
    employee_photo: post.employee_photo || "",
    status: post.status,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Use memoized payment info to prevent excessive calls
  const paymentInfo = usePaymentInfo(post);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onEdit(post.id, {
        post_type: formData.post_type,
        work: formData.work,
        time: formData.time,
        place: formData.place,
        salary: formData.salary,
        contact: formData.contact,
        photo_url: formData.photo_url || null,
        employee_photo: formData.employee_photo || null,
        status: formData.status,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      post_type: post.post_type,
      work: post.work,
      time: post.time,
      place: post.place,
      salary: post.salary,
      contact: post.contact,
      photo_url: post.photo_url || "",
      employee_photo: post.employee_photo || "",
      status: post.status,
    });
    setIsEditing(false);
  };

  const TIME_OPTIONS = ["Morning", "Day (9–5)", "Evening", "Night", "Full Time", "Part Time"];

  const isHiring = post.post_type === "employer";
  const [imageError, setImageError] = useState(false);
  
  // Determine which photo to display
  const displayPhoto = isHiring ? post.photo_url : post.employee_photo;
  
  // Debug logging
  console.log(`🔍 Admin PostCard Debug:`, {
    id: post.id,
    post_type: post.post_type,
    work: post.work,
    photo_url: post.photo_url,
    employee_photo: post.employee_photo,
    isHiring,
    displayPhoto,
    hasDisplayPhoto: !!displayPhoto
  });

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Photo or Placeholder - For All Posts */}
        <div className="relative w-full lg:w-48 lg:flex-shrink-0 rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
          {displayPhoto && !imageError ? (
            // Show photo if available
            <img
              src={displayPhoto}
              alt={post.work}
              className="w-full h-full object-cover"
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            // Show placeholder if no photo
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              {isHiring ? (
                <>
                  <svg
                    className="w-12 h-12 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs mt-2 opacity-75">Employer</p>
                  <p className="text-xs opacity-75">No Photo</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <p className="text-xs mt-2 opacity-75">Employee</p>
                  <p className="text-xs opacity-75">No Photo</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                post.post_type === "employer"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {post.post_type === "employer" ? "Hire Staff" : "Find a Job"}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                post.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : post.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {post.status}
            </span>
            {/* Payment Status Badge */}
            {(() => {
              return (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    paymentInfo.status === "approved"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : paymentInfo.status === "pending" || paymentInfo.status === "paid"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : paymentInfo.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {paymentInfo.status === "none" ? "No Payment" : 
                   paymentInfo.status === "pending" ? "Payment Pending" :
                   paymentInfo.status === "paid" ? "Payment Paid" :
                   paymentInfo.status === "approved" ? "Payment Approved" :
                   paymentInfo.status === "rejected" ? "Payment Rejected" : paymentInfo.status}
                </span>
              );
            })()}
          </div>

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Post Type</label>
                  <select
                    value={formData.post_type}
                    onChange={(e) => setFormData({ ...formData, post_type: e.target.value as "employer" | "employee" })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="employer">Hire Staff</option>
                    <option value="employee">Find a Job</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "pending" | "approved" | "hidden" })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Work</label>
                  <input
                    type="text"
                    value={formData.work}
                    onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Time</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Place</label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
                {formData.post_type === "employee" ? (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Employee Photo URL</label>
                    <input
                      type="text"
                      value={formData.employee_photo || ""}
                      onChange={(e) => setFormData({ ...formData, employee_photo: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Employee profile photo (visible before approval)</p>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Post Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo_url || ""}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Post-related photo (visible before approval)</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <h3 className="font-semibold text-lg mb-2">{post.work}</h3>
              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <p>
                  <span className="font-medium">Time:</span> {post.time}
                </p>
                <p>
                  <span className="font-medium">Place:</span> {post.place}
                </p>
                <p>
                  <span className="font-medium">Salary:</span> {post.salary}
                </p>
                <p>
                  <span className="font-medium">Contact:</span> {post.contact}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                >
                  Edit
                </Button>
                
                {/* Payment Actions */}
                {(() => {
                  // Debug logging - expand paymentInfo
                  console.log('🔍 Payment Info Debug:', {
                    postId: post.id,
                    postWork: post.work,
                    paymentInfo: {
                      status: paymentInfo.status,
                      type: paymentInfo.type,
                      receiptUrl: paymentInfo.receiptUrl
                    },
                    hasContactRequests: (post.contact_unlock_requests?.length || 0) > 0,
                    contactRequests: post.contact_unlock_requests || [],
                    rawContactRequests: post.contact_unlock_requests
                  });

                  if (paymentInfo.status === "pending" || paymentInfo.status === "paid") {
                    if (paymentInfo.receiptUrl) {
                      return (
                        <>
                          <Button
                            onClick={() => onViewReceipt(post)}
                            size="sm"
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50"
                          >
                            🧾 View Receipt
                          </Button>
                          {paymentInfo.type === 'contact_unlock' && (
                            <Button
                              onClick={() => onMissingReceipt(post)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              👥 View Contact Requests
                            </Button>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <Button
                          onClick={() => onMissingReceipt(post)}
                          size="sm"
                          variant="outline"
                          className={paymentInfo.type === 'contact_unlock' 
                            ? "border-blue-600 text-blue-600 hover:bg-blue-50" 
                            : "border-orange-600 text-orange-600 hover:bg-orange-50"
                          }
                        >
                          {paymentInfo.type === 'contact_unlock' ? '👥 View Contact Requests' : '📄 Receipt Missing'}
                        </Button>
                      );
                    }
                  }
                  return null;
                })()}
                {post.status === "pending" && (
                  <Button
                    onClick={() => onStatusChange(post.id, "approved")}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                )}
                {post.status !== "hidden" && (
                  <Button
                    onClick={() => onStatusChange(post.id, "hidden")}
                    size="sm"
                    variant="outline"
                  >
                    Hide
                  </Button>
                )}
                {post.status === "hidden" && (
                  <Button
                    onClick={() => onStatusChange(post.id, "approved")}
                    size="sm"
                    variant="outline"
                  >
                    Unhide
                  </Button>
                )}
                <Button
                  onClick={() => onDelete(post.id)}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
