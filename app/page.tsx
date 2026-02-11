"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react";
import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { PostWithMaskedContact } from "@/lib/types";
import { EnvironmentCheck } from "@/components/EnvironmentCheck";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, LoadMoreButton } from "@/components/ui/pagination";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { registerCreatePostHandler } from "@/components/layout/ConditionalHeader";

// Static Marketing Banner Component - Won't re-render on tab changes
function MarketingBanner() {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      {/* Banner removed completely */}
    </div>
  );
}

// Post Creation Component
function PostCreation({ onClose }: { onClose: () => void }) {
  // This will be a simplified version of the post creation form
  // For now, we'll show a placeholder
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading post creation form...</p>
          <p className="text-sm text-gray-500 mt-2">This will open the full post creation interface</p>
        </div>
      </div>
    </div>
  );
}
function JobTypeTabs({ activeTab, onTabChange }: { 
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "all" | "employer" | "employee") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 bg-gray-100 p-2 sm:p-1 rounded-lg">
      <button
        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === "employee" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onTabChange("employee")}
      >
        <span className="text-xs sm:text-sm">Find a Job</span>
      </button>
      <button
        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === "employer" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onTabChange("employer")}
      >
        <span className="text-xs sm:text-sm">Hire a Worker</span>
      </button>
    </div>
  );
}
function PostsGrid({ 
  posts, 
  isLoading, 
  isTabChanging 
}: { 
  posts: PostWithMaskedContact[];
  isLoading: boolean;
  isTabChanging: boolean;
}) {
  if (isTabChanging) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading posts...</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-8 w-full opacity-30">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No posts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// Static FilterBar Component - Memoized to prevent re-renders
const StaticFilterBar = React.memo(function StaticFilterBar({ 
  filters, 
  onFilterChange 
}: { 
  filters: {
    work: string;
    time: string;
    postedTime: string;
    place: string;
    salary: string;
  };
  onFilterChange: (filters: any) => void;
}) {
  return (
    <FilterBar 
      workFilter={filters.work}
      timeFilter={filters.time}
      postedTimeFilter={filters.postedTime}
      placeFilter={filters.place}
      salaryFilter={filters.salary}
      onWorkChange={(value) => onFilterChange({ ...filters, work: value })}
      onTimeChange={(value) => onFilterChange({ ...filters, time: value })}
      onPostedTimeChange={(value) => onFilterChange({ ...filters, postedTime: value })}
      onPlaceChange={(value) => onFilterChange({ ...filters, place: value })}
      onSalaryChange={(value) => onFilterChange({ ...filters, salary: value })}
      onReset={() => onFilterChange({ work: "All", time: "All", postedTime: "all", place: "", salary: "" })}
    />
  );
});
function PageHeader() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">Opportunities</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Stable Section Component - Completely separate from tab logic
function StableSection() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <MarketingBanner />
    </div>
  );
}

function HomePageContent({ activeTab, isTabChanging }: { activeTab: "all" | "employer" | "employee"; isTabChanging: boolean }) {
  // State management
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Ref to store the latest loadPosts function
  const loadPostsRef = useRef<typeof loadPosts | null>(null);
  
  // Filters - simplified since we're not using them right now
  const [filters] = useState({
    work: "All",
    time: "All",
    postedTime: "all",
    place: "",
    salary: "",
  });

  // Handle create post
  const handleCreatePost = useCallback(() => {
    console.log('handleCreatePost called, setting showCreatePost to true');
    setShowCreatePost(true);
  }, []);

  const handleCloseCreatePost = useCallback(() => {
    console.log('handleCloseCreatePost called, setting showCreatePost to false');
    setShowCreatePost(false);
  }, []);

  // Register the handler with the ConditionalHeader
  useEffect(() => {
    console.log('Registering createPostHandler');
    registerCreatePostHandler(handleCreatePost);
    
    return () => {
      console.log('Cleaning up createPostHandler');
      registerCreatePostHandler(() => {});
    };
  }, [handleCreatePost]);
  
  // Load posts - enabled to fetch posts from database
  const loadPosts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      if (reset) {
        setPosts([]);
        setError(null);
      }

      // Use API endpoint instead of client-side function
      const response = await fetch(`/api/public-posts?page=${page}&limit=12&postType=${activeTab}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      const result = {
        posts: data.posts || [],
        total: data.pagination?.totalItems || 0,
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPrevPage: data.pagination?.hasPrevPage || false,
        error: null
      };

      setPosts(prev => {
        const newPosts = reset ? result.posts : [...prev, ...result.posts];
        return newPosts;
      });
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalPosts(result.total);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsPageChanging(false);
    }
  }, [activeTab]);

  // Store the latest loadPosts function in ref
  loadPostsRef.current = loadPosts;

  // Set initial state to load posts on component mount
  useEffect(() => {
    setPosts([]);
    setIsLoading(true);
    setError(null);
    // Load posts on component mount
    loadPosts(1, true);
  }, []);

  // Initialize page state
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Load posts when activeTab changes
  useEffect(() => {
    if (activeTab && loadPostsRef.current) {
      loadPostsRef.current(1, true);
    }
  }, [activeTab]);

  // Use posts from state
  const filteredPosts: PostWithMaskedContact[] = posts;

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: any) => {
    // Reload posts with new filters
    loadPosts(1, true);
  }, [loadPosts]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setIsPageChanging(true);
    loadPosts(page, false);
  }, [loadPosts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    loadPosts(currentPage + 1, false);
  }, [currentPage, loadPosts]);

  // Single return statement - no duplicates
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      {showCreatePost ? (
        <>
          {console.log('Rendering PostCreation component')}
          <PostCreation onClose={handleCloseCreatePost} />
        </>
      ) : (
        <>
          {console.log('Rendering normal content')}
          {/* Job Type Tabs */}
          <JobTypeTabs 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              // This will be handled by the parent component
              const event = new CustomEvent('jobTabChange', { detail: { tab } });
              window.dispatchEvent(event);
            }}
          />
          
          <StaticFilterBar filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Posts Grid - handles all states internally */}
          <PostsGrid 
            posts={filteredPosts} 
            isLoading={isLoading} 
            isTabChanging={isTabChanging}
          />
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Main HomePage Component - Tabs in main content area
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | "employer" | "employee">("employee");
  const [isTabChanging, setIsTabChanging] = useState(false);
  
  const handleTabChange = useCallback((tab: "all" | "employer" | "employee") => {
    setActiveTab(tab);
    setIsTabChanging(true);
    // Reset tab changing after a short delay
    setTimeout(() => setIsTabChanging(false), 500);
  }, []);

  // Listen for tab changes from main content area
  useEffect(() => {
    const handleJobTabChange = (event: CustomEvent) => {
      handleTabChange(event.detail.tab);
    };

    window.addEventListener('jobTabChange', handleJobTabChange as EventListener);
    
    return () => {
      window.removeEventListener('jobTabChange', handleJobTabChange as EventListener);
    };
  }, [handleTabChange]);
  
  return (
    <EnvironmentCheck>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          <StableSection />
          
          <div className="w-full">
            <HomePageContent activeTab={activeTab} isTabChanging={isTabChanging} />
          </div>
        </div>
      </Suspense>
    </EnvironmentCheck>
  );
}
