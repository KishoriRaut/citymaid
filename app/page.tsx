"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { getPublicPostsClient, type PostWithMaskedContact } from "@/lib/posts-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/marketplace/Tabs";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Pagination } from "@/components/marketplace/Pagination";

export default function Home() {
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Primary tab: "Hiring" (employer) is default
  const [activeTab, setActiveTab] = useState<"employer" | "employee">("employer");
  
  // Filters
  const [filters, setFilters] = useState({
    work: "All",
    time: "All",
    place: "",
    salary: "",
  });
  
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 9; // 8-10 cards initially

  // Store all fetched posts for client-side filtering
  const [allPosts, setAllPosts] = useState<PostWithMaskedContact[]>([]);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all posts for the active tab (use large limit to get all)
      // We'll handle pagination client-side after filtering
      const { posts: fetchedPosts, total, error: fetchError } = await getPublicPostsClient({
        post_type: activeTab,
        work: filters.work === "All" ? undefined : filters.work,
        limit: 1000, // Large limit to fetch all, then filter client-side
        offset: 0,
      });

      if (fetchError) {
        setError(fetchError);
        setIsLoading(false);
        return;
      }

      // Apply client-side filters (time, place, salary)
      let filteredPosts = fetchedPosts;
      
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
      
      if (filters.salary) {
        filteredPosts = filteredPosts.filter((p) =>
          p.salary.toLowerCase().includes(filters.salary.toLowerCase())
        );
      }

      // Store all filtered posts
      setAllPosts(filteredPosts);
      
      // Apply pagination - show first page
      const paginatedPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
      setPosts(paginatedPosts);
      setOffset(POSTS_PER_PAGE);
      setHasMore(filteredPosts.length > POSTS_PER_PAGE);
      setCurrentPage(1);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts");
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    setPosts(paginatedPosts);
    setCurrentPage(page);
    setOffset(endIndex);
    setHasMore(endIndex < allPosts.length);
    
    // Scroll to top of posts grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      work: "All",
      time: "All",
      place: "",
      salary: "",
    });
  };

  // Reload when tab or any filter changes
  useEffect(() => {
    loadPosts();
  }, [activeTab, filters.work, filters.time, filters.place, filters.salary]);

  const handleTabChange = (tab: "employer" | "employee") => {
    setActiveTab(tab);
    setOffset(0);
    setHasMore(true);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOffset(0);
    setHasMore(true);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Clean Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">CityMaid Marketplace</h1>
        <p className="text-muted-foreground text-lg">Find work or hire help in your city</p>
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
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
          <p className="font-semibold mb-2">Error loading posts:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading && posts.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
