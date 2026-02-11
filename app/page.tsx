"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react";
import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { PostWithMaskedContact } from "@/lib/types";
import { EnvironmentCheck } from "@/components/EnvironmentCheck";
import { Tabs } from "@/components/marketplace/Tabs";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, LoadMoreButton } from "@/components/ui/pagination";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Static Marketing Banner Component - Won't re-render on tab changes
function MarketingBanner() {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      {/* Banner removed completely */}
    </div>
  );
}

// Individual Tab Components - No props that change, completely stable
const EmployeeTab = React.memo(function EmployeeTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-tab="employee"
      className="tab-button flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-gray-900"
      onClick={onClick}
    >
      <span className="text-xs sm:text-sm">Find a Job</span>
    </button>
  );
});

const EmployerTab = React.memo(function EmployerTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-tab="employer"
      className="tab-button flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-gray-900"
      onClick={onClick}
    >
      <span className="text-xs sm:text-sm">Hire a Worker</span>
    </button>
  );
});

// Tabs Container - Handles active state with CSS, individual tabs never re-render
function StableTabs({ activeTab, onTabChange }: { 
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "all" | "employer" | "employee") => void;
}) {
  // Update CSS to show active state
  useEffect(() => {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
      tab.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
      tab.classList.add('text-gray-600');
    });
    
    // Add active class to current tab
    const activeTabElement = document.querySelector(`[data-tab="${activeTab}"]`);
    if (activeTabElement) {
      activeTabElement.classList.remove('text-gray-600');
      activeTabElement.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 bg-gray-100 p-2 sm:p-1 rounded-lg">
      <EmployeeTab onClick={() => onTabChange("employee")} />
      <EmployerTab onClick={() => onTabChange("employer")} />
    </div>
  );
}

// Posts Grid Component - Only this part should re-render
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

// Tab Section Component - Only this re-renders
function TabSection({ 
  activeTab, 
  filters, 
  onFilterChange, 
  filteredPosts, 
  isLoading, 
  isTabChanging, 
  isPageChanging, 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPrevPage, 
  onPageChange, 
  totalPosts, 
  handleLoadMore 
}: {
  activeTab: "all" | "employer" | "employee";
  filters: any;
  onFilterChange: (filters: any) => void;
  filteredPosts: PostWithMaskedContact[];
  isLoading: boolean;
  isTabChanging: boolean;
  isPageChanging: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  totalPosts: number;
  handleLoadMore: () => void;
}) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <StaticFilterBar filters={filters} onFilterChange={onFilterChange} />
      
      {/* Only Posts Grid should change */}
      <PostsGrid posts={filteredPosts} isLoading={isLoading} isTabChanging={isTabChanging} />

      {/* Page change loading indicator */}
      {isPageChanging && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Pagination */}
      <div className="space-y-4">
        {/* Traditional pagination for desktop */}
        <div className="hidden md:block">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={onPageChange}
            isLoading={isPageChanging}
            totalPosts={totalPosts}
          />
        </div>

        {/* Load more button for mobile */}
        <div className="md:hidden">
          <LoadMoreButton
            hasNextPage={hasNextPage}
            isLoading={isPageChanging}
            onLoadMore={handleLoadMore}
            remainingPosts={totalPosts - (currentPage * 12)} // Keep original calculation for pagination
          />
        </div>
      </div>
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

  // Show disabled message
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Temporarily Unavailable</h2>
        <p className="text-muted-foreground max-w-md">
          We're currently performing maintenance on our post loading system. 
          Please check back later or contact support if you need assistance.
        </p>
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Button onClick={() => loadPosts(1, true)} className="mr-4">
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
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
        <StaticFilterBar filters={filters} onFilterChange={handleFilterChange} />
        
        <EmptyState 
          activeTab={activeTab}
        />
      </div>
    );
  }

  // Show posts
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <StaticFilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => loadPosts(1, true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Posts */}
      {!isLoading && !error && posts.length > 0 && (
        <>
          <p className="mb-4 text-gray-600">Showing {posts.length} posts</p>
          <PostsGrid 
            posts={filteredPosts} 
            isLoading={isLoading} 
            isTabChanging={isTabChanging}
          />
        </>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No posts found</p>
        </div>
      )}
      
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

// Main HomePage Component - Tabs outside stateful component
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | "employer" | "employee">("employee");
  const [isTabChanging, setIsTabChanging] = useState(false);
  
  const handleTabChange = useCallback((tab: "all" | "employer" | "employee") => {
    setActiveTab(tab);
    setIsTabChanging(true);
    // Reset tab changing after a short delay
    setTimeout(() => setIsTabChanging(false), 500);
  }, []);

  // Listen for tab changes from sidebar (using custom event)
  useEffect(() => {
    const handleSidebarTabChange = (event: CustomEvent) => {
      handleTabChange(event.detail.tab);
    };

    window.addEventListener('sidebarTabChange', handleSidebarTabChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarTabChange', handleSidebarTabChange as EventListener);
    };
  }, [handleTabChange]);
  
  return (
    <EnvironmentCheck>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          <StableSection />
          
          {/* Removed duplicate tabs from main content area */}
          {/* Tabs are now only in the sidebar */}
          
          <div className="w-full">
            <HomePageContent activeTab={activeTab} isTabChanging={isTabChanging} />
          </div>
        </div>
      </Suspense>
    </EnvironmentCheck>
  );
}
