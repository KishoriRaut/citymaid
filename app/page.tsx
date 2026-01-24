"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getPublicPostsClient } from "@/lib/posts-client";
import type { PostWithMaskedContact } from "@/lib/types";
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

  // Primary tab: "employee" (Find a Job) is now default
  const [activeTab, setActiveTab] = useState<"all" | "employer" | "employee">("employee");

  // Filters
  const [filters, setFilters] = useState({
    work: "All",
    time: "All",
    place: "",
    salary: "",
  });

  const [hasMore, setHasMore] = useState(true);

  // Load posts function
  const loadPosts = useCallback(async (reset = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const result = await getPublicPostsClient();

      
      if (result.error) {
        setError(result.error);
        setPosts([]);
        setHasMore(false);
        return;
      }

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }
      
      setHasMore(result.posts.length >= 50); // If we got 50 posts, there might be more
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      setPosts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Filter posts based on active tab and filters
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by post type (tab)
    if (activeTab !== "all") {
      filtered = filtered.filter(post => post.post_type === activeTab);
    }

    // Filter by work type
    if (filters.work !== "All") {
      filtered = filtered.filter(post => post.work === filters.work);
    }

    // Filter by time
    if (filters.time !== "All") {
      filtered = filtered.filter(post => post.time === filters.time);
    }

    // Filter by place
    if (filters.place.trim()) {
      filtered = filtered.filter(post => 
        post.place.toLowerCase().includes(filters.place.toLowerCase())
      );
    }

    // Filter by salary
    if (filters.salary.trim()) {
      filtered = filtered.filter(post => 
        post.salary.toLowerCase().includes(filters.salary.toLowerCase())
      );
    }

    return filtered;
  }, [posts, activeTab, filters]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    loadPosts(false);
  }, [loadPosts]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Posts</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => loadPosts()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (filteredPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
          <FilterBar 
            workFilter={filters.work}
            timeFilter={filters.time}
            placeFilter={filters.place}
            salaryFilter={filters.salary}
            onWorkChange={(value) => handleFilterChange({ ...filters, work: value })}
            onTimeChange={(value) => handleFilterChange({ ...filters, time: value })}
            onPlaceChange={(value) => handleFilterChange({ ...filters, place: value })}
            onSalaryChange={(value) => handleFilterChange({ ...filters, salary: value })}
            onReset={() => handleFilterChange({ work: "All", time: "All", place: "", salary: "" })}
          />
          
          <EmptyState 
            activeTab={activeTab}
          />
        </div>
      </div>
    );
  }

  // Show posts
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        <FilterBar 
          workFilter={filters.work}
          timeFilter={filters.time}
          placeFilter={filters.place}
          salaryFilter={filters.salary}
          onWorkChange={(value) => handleFilterChange({ ...filters, work: value })}
          onTimeChange={(value) => handleFilterChange({ ...filters, time: value })}
          onPlaceChange={(value) => handleFilterChange({ ...filters, place: value })}
          onSalaryChange={(value) => handleFilterChange({ ...filters, salary: value })}
          onReset={() => handleFilterChange({ work: "All", time: "All", place: "", salary: "" })}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
            />
          ))}
        </div>

        {hasMore && !isLoadingMore && filteredPosts.length >= 12 && (
          <LoadMore 
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore} 
          />
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
