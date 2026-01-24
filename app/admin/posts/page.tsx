"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/shared/button";
import { Skeleton } from "@/components/shared/skeleton";
import { getAllPosts, updatePostStatus, deletePost, updatePost } from "@/lib/posts";
import type { Post } from "@/lib/types";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  onStatusChange,
  onDelete,
  onEdit,
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
    status?: "pending" | "approved" | "hidden";
  }) => void;
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
    status: post.status,
  });
  const [isSaving, setIsSaving] = useState(false);

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
      status: post.status,
    });
    setIsEditing(false);
  };

  const TIME_OPTIONS = ["Morning", "Day (9–5)", "Evening", "Night", "Full Time", "Part Time"];

  const isHiring = post.post_type === "employer";
  const [imageError, setImageError] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Photo or Placeholder - Only for Employee Posts */}
        {!isHiring && (
          <div className="relative w-full lg:w-48 lg:flex-shrink-0 rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
            {post.photo_url && !imageError ? (
              // Employee posts: Show photo if available
              <img
                src={post.photo_url}
                alt={post.work}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              // Employee posts: Show user icon if no photo
              <div className="flex flex-col items-center justify-center text-muted-foreground">
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
                <p className="text-xs mt-2 opacity-75">No photo available</p>
              </div>
            )}
          </div>
        )}

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
                {formData.post_type === "employee" && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave empty to remove photo</p>
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
