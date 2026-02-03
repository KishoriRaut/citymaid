"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getPublicPostsClient } from "@/lib/posts-client";
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
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
              <div className="flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6">
                {/* Contact Unlock Section */}
                <div className="flex-1 w-full xl:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-lg sm:text-xl">🔓</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">Unlock Contacts</h3>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm mb-2">
                    Get instant access to contact details for just <span className="font-bold text-yellow-300">NRs. 300</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      ✓ Verified
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      ✓ Instant
                    </span>
                  </div>
                </div>

                {/* Post Promotion Section */}
                <div className="flex-1 w-full xl:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-lg sm:text-xl">⭐</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">Feature Your Post</h3>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm mb-2">
                    Get maximum visibility on homepage for <span className="font-bold text-yellow-300">NRs. 300</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      ✓ 30 Days
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      ✓ Top Placement
                    </span>
                  </div>
                </div>
                
                {/* CTA Section */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 w-full xl:w-auto">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">
                      Start Today
                    </div>
                    <div className="text-xs text-white/80 text-center">
                      NRs. 300
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-4 sm:px-6 py-2 shadow-lg w-full sm:w-auto xl:w-auto"
                    onClick={() => {
                      // Navigate to create post page
                      router.push('/post');
                    }}
                  >
                    Create Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
      <PageHeader />
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get initial page from URL or default to 1
  const initialPage = Number(searchParams.get('page')) || 1;

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters
  const [filters, setFilters] = useState({
    work: "All",
    time: "All",
    postedTime: "all",
    place: "",
    salary: "",
  });

  // Load posts with server-side filtering
  const loadPosts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      console.log(`📥 loadPosts called: page=${page}, reset=${reset}, currentPage state=${currentPage}`);
      
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsPageChanging(true);
      }
      
      console.log(`🔍 Loading posts from Supabase...`);
      
      // INDUSTRY STANDARD: Server-side filtering + fixed 12 posts per page
      const result = await getPublicPostsClient(page, 12, activeTab, filters.postedTime);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.posts.length === 0 && page === 1) {
        console.log("⚠️ No posts found");
      }
      
      setPosts(result.posts);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalPosts(result.total);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
      
      console.log(`✅ Loaded ${result.posts.length} posts from Supabase (Page ${result.currentPage} of ${result.totalPages})`);
      console.log(`📊 State updated: currentPage=${result.currentPage}, totalPages=${result.totalPages}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      console.error("❌ Failed to load posts:", err);
    } finally {
      setIsLoading(false);
      setIsPageChanging(false);
    }
  }, [activeTab, filters.postedTime]);

  // Initialize page state from URL
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Initial load and page changes
  useEffect(() => {
    if (mounted) { // Only load after component is mounted
      loadPosts(initialPage, true);
    }
  }, [initialPage, loadPosts, mounted]);

  // Reload posts when posted time filter changes
  useEffect(() => {
    if (mounted) {
      setCurrentPage(1); // Reset to first page when filter changes
      loadPosts(1, true);
    }
  }, [filters.postedTime, loadPosts, mounted]);

  // No client-side filtering needed - server handles it
  const filteredPosts = posts;

  // Debug post rendering
  useEffect(() => {
    console.log(`🎨 Server-Side Filtering Results:`);
    console.log(`  - Posts per page: 12 (fixed)`);
    console.log(`  - Posts returned: ${filteredPosts.length} (already filtered by server)`);
    console.log(`  - Active tab: ${activeTab}`);
    console.log(`  - Current page: ${currentPage}`);
    console.log(`  - Layout: 3-column grid`);
    
    // Server-side filtering ensures consistent results
    const completeRows = Math.floor(filteredPosts.length / 3);
    const remainingCards = filteredPosts.length % 3;
    console.log(`  - Complete rows: ${completeRows}`);
    console.log(`  - Remaining cards: ${remainingCards}`);
  }, [filteredPosts, activeTab, currentPage]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    console.log(`🔄 handlePageChange called: requesting page ${page}, current page is ${currentPage}`);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
    
    // Load posts for the new page - let loadPosts handle state updates
    loadPosts(page, false);
  }, [loadPosts, searchParams, pathname, router, currentPage]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [hasNextPage, currentPage, handlePageChange]);

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

  // Show posts - Only tab section
  return (
    <TabSection 
      activeTab={activeTab}
      filters={filters}
      onFilterChange={handleFilterChange}
      filteredPosts={filteredPosts}
      isLoading={isLoading}
      isTabChanging={isTabChanging}
      isPageChanging={isPageChanging}
      currentPage={currentPage}
      totalPages={totalPages}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
      onPageChange={handlePageChange}
      totalPosts={totalPosts}
      handleLoadMore={handleLoadMore}
    />
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
  
  return (
    <EnvironmentCheck>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          <StableSection />
          
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
            <StableTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          
          <div className="w-full">
            <HomePageContent activeTab={activeTab} isTabChanging={isTabChanging} />
          </div>
        </div>
      </Suspense>
    </EnvironmentCheck>
  );
}
