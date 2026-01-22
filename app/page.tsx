"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { getPublicPostsClient, type PostWithMaskedContact } from "@/lib/posts-client";
import { maskContact } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const WORK_OPTIONS = [
  "All",
  "Cooking",
  "Cleaning",
  "Cooking + Cleaning",
  "Babysitting",
  "Elder Care",
  "Other",
];

export default function Home() {
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    post_type: "all" as "all" | "employer" | "employee",
    work: "All",
  });
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const POSTS_PER_PAGE = 12;

  const loadPosts = async (reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading posts...", { filters, reset });
      const currentOffset = reset ? 0 : offset;
      const { posts: newPosts, total, error: fetchError } = await getPublicPostsClient({
        post_type: filters.post_type === "all" ? undefined : filters.post_type,
        work: filters.work === "All" ? undefined : filters.work,
        limit: POSTS_PER_PAGE,
        offset: currentOffset,
      });

      console.log("📦 Posts result:", { 
        count: newPosts?.length || 0, 
        total, 
        error: fetchError 
      });

      if (fetchError) {
        console.error("❌ Fetch error:", fetchError);
        setError(fetchError);
        setIsLoading(false);
        return;
      }

      if (reset) {
        setPosts(newPosts);
        setOffset(newPosts.length);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + newPosts.length);
      }

      setHasMore((currentOffset + newPosts.length) < (total || 0));
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, [filters.post_type, filters.work]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOffset(0);
    setHasMore(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">CityMaid Marketplace</h1>
        <p className="text-muted-foreground">Find work or hire help in your city</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        {/* Role Toggle */}
        <div className="flex gap-2 border rounded-md p-1 bg-background">
          <button
            onClick={() => handleFilterChange("post_type", "all")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.post_type === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("post_type", "employer")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.post_type === "employer"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            Hiring
          </button>
          <button
            onClick={() => handleFilterChange("post_type", "employee")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.post_type === "employee"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            Looking for Work
          </button>
        </div>

        {/* Work Filter */}
        <select
          value={filters.work}
          onChange={(e) => handleFilterChange("work", e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border rounded-md bg-background"
        >
          {WORK_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {/* Post Button */}
        <Link href={appConfig.routes.post} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Create Post</Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
          <p className="font-semibold mb-2">Error loading posts:</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-75">
            Check browser console (F12) for more details. Make sure:
            <br />1. The get_public_posts() function exists in Supabase
            <br />2. You have approved posts (status = 'approved')
            <br />3. NEXT_PUBLIC_SUPABASE_ANON_KEY is set in .env.local
          </p>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading && posts.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found. Be the first to create one!</p>
          <Link href={appConfig.routes.post} className="mt-4 inline-block">
            <Button>Create Post</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => loadPosts(false)}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PostCard({ post }: { post: PostWithMaskedContact }) {
  const contactVisible = post.contact !== null;
  const maskedContact = post.contact ? maskContact(post.contact) : "****";

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      {post.photo_url && (
        <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden bg-muted">
          <img
            src={post.photo_url}
            alt={post.work}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
            post.post_type === "employer"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {post.post_type === "employer" ? "Hiring" : "Looking for Work"}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-lg">{post.work}</h3>
        <div className="text-sm text-muted-foreground space-y-1">
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
            <span className="font-medium">Contact:</span>{" "}
            {contactVisible ? (
              <span className="text-foreground">{post.contact}</span>
            ) : (
              <span className="font-mono">{maskedContact}</span>
            )}
          </p>
        </div>
      </div>

      {/* Unlock Button */}
      {!contactVisible && (
        <Link href={`${appConfig.routes.unlock}/${post.id}`} className="block">
          <Button className="w-full" variant="outline">
            Unlock Contact
          </Button>
        </Link>
      )}
    </div>
  );
}
