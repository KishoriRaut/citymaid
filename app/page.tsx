"use client";

import { useEffect, useState } from "react";
import { appConfig } from "@/lib/config";
import { getPublicPostsClient } from "@/lib/posts-client";
import type { PostWithMaskedContact } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/marketplace/Tabs";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { LoadMore } from "@/components/marketplace/LoadMore";

export default function Home() {
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Primary tab: "employer" is default
  const [activeTab, setActiveTab] = useState<"employer" | "employee">("employer");
  
  // Filters
  const [filters, setFilters] = useState({
    work: "All",
    time: "All",
    place: "",
    salary: "",
  });
  
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_LOAD = 12; // Load 10-15 posts at a time

  // Store all fetched posts for client-side filtering
  const [allPosts, setAllPosts] = useState<PostWithMaskedContact[]>([]);

  const loadPosts = async (append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      // Fetch all posts (use large limit to get all for filtering)
      const { posts: fetchedPosts, total, error: fetchError } = await getPublicPostsClient({
        post_type: activeTab,
        work: filters.work === "All" ? undefined : filters.work,
        limit: 1000, // Large limit to fetch all, then filter client-side
        offset: 0,
      });

      if (fetchError) {
        setError(fetchError);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      // Apply client-side filters
      let filteredPosts = fetchedPosts;
      
      // Filter by post_type (already filtered by API, but ensure consistency)
      filteredPosts = filteredPosts.filter((p) => p.post_type === activeTab);
      
      if (filters.time !== "All") {
        filteredPosts = filteredPosts.filter((p) => 
          p.time.toLowerCase().includes(filters.time.toLowerCase())
        );
      }
      
      if (filters.place) {
        filteredPosts = filteredPosts.filter((p) =>
          p.place.toLowerCase().includes(filters.place.toLowerCase())
        );
      }
      
      // Salary filter (search within salary text)
      if (filters.salary) {
        filteredPosts = filteredPosts.filter((p) =>
          p.salary.toLowerCase().includes(filters.salary.toLowerCase())
        );
      }

      // Store all filtered posts
      setAllPosts(filteredPosts);
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("Total filtered posts:", filteredPosts.length);
        console.log("Posts per load:", POSTS_PER_LOAD);
      }
      
      // Apply Load More pattern
      if (append) {
        // Append more posts
        const currentCount = posts.length;
        const newPosts = filteredPosts.slice(currentCount, currentCount + POSTS_PER_LOAD);
        setPosts([...posts, ...newPosts]);
        setHasMore(currentCount + newPosts.length < filteredPosts.length);
        
        if (process.env.NODE_ENV === "development") {
          console.log("Appending posts. Current:", currentCount, "New:", newPosts.length, "Total after:", posts.length + newPosts.length);
        }
      } else {
        // Initial load - show first batch
        const initialPosts = filteredPosts.slice(0, POSTS_PER_LOAD);
        setPosts(initialPosts);
        setHasMore(filteredPosts.length > POSTS_PER_LOAD);
        
        if (process.env.NODE_ENV === "development") {
          console.log("Initial load. Showing:", initialPosts.length, "out of", filteredPosts.length, "total posts");
        }
      }
      
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading posts:", err);
      }
      setError("Failed to load posts");
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadPosts(true);
  };

  const handleResetFilters = () => {
    setFilters({
      work: "All",
      time: "All",
      place: "",
      salary: "",
    });
  };

  // Reload when tab or any filter changes (initial load, not append)
  useEffect(() => {
    loadPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.work, filters.time, filters.place, filters.salary]);

  const handleTabChange = (tab: "employer" | "employee") => {
    setActiveTab(tab);
    setPosts([]);
    setHasMore(true);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPosts([]);
    setHasMore(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Clean Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">CityMaid Marketplace</h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">Hire trusted local workers or find jobs near you — fast and safe.</p>
      </div>

      {/* Primary Tabs */}
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filter Bar */}
      <FilterBar
        workFilter={filters.work}
        timeFilter={filters.time}
        placeFilter={filters.place}
        salaryFilter={filters.salary}
        onWorkChange={(value) => handleFilterChange("work", value)}
        onTimeChange={(value) => handleFilterChange("time", value)}
        onPlaceChange={(value) => handleFilterChange("place", value)}
        onSalaryChange={(value) => handleFilterChange("salary", value)}
        onReset={handleResetFilters}
      />

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="font-semibold mb-1.5">Error loading posts:</p>
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading && posts.length === 0 ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-40 w-full mb-4 rounded-lg" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More */}
          <LoadMore
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </>
      )}
    </div>
  );
}
