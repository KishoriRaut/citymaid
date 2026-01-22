"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllPosts, updatePostStatus, deletePost } from "@/lib/posts";
import type { Post } from "@/lib/types";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
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
  };

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
}: {
  post: Post;
  onStatusChange: (postId: string, status: "approved" | "hidden") => void;
  onDelete: (postId: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Photo */}
        {post.photo_url && (
          <div className="relative h-48 lg:h-32 lg:w-48 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <img
              src={post.photo_url}
              alt={post.work}
              className="w-full h-full object-cover"
            />
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
              {post.post_type === "employer" ? "Hiring" : "Looking for Work"}
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
        </div>
      </div>
    </div>
  );
}
