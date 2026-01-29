"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getPublicPostsClient } from "@/lib/posts-client";
import type { Post } from "@/lib/types";
import { EnvironmentCheck } from "@/components/EnvironmentCheck";
import { Tabs } from "@/components/marketplace/Tabs";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

function HomePageContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load posts from Supabase
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔍 Loading posts from Supabase...");
      const result = await getPublicPostsClient();
      const fetchedPosts = result.posts;
      
      if (fetchedPosts.length === 0) {
        console.log("⚠️ No posts found");
      }
      
      setPosts(fetchedPosts);
      console.log(`✅ Loaded ${fetchedPosts.length} posts from Supabase`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      console.error("❌ Failed to load posts:", err);
    } finally {
      setIsLoading(false);
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Unable to Load Posts</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button onClick={loadPosts} className="mr-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (filteredPosts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Job Listings</CardTitle>
          </CardHeader>
        </Card>
        
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

        {/* Load more functionality can be implemented here when needed */}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <EnvironmentCheck>
      <HomePageContent />
    </EnvironmentCheck>
  );
}
