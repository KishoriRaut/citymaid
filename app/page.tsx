"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getPublicPostsClient } from "@/lib/posts-client";
import { compareAdminVsHomepage } from "@/lib/admin-vs-homepage-diagnostic";
import { EnvironmentCheck } from "@/components/EnvironmentCheck";
import type { PostWithMaskedContact } from "@/lib/types";
import { Tabs } from "@/components/marketplace/Tabs";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { LoadMore } from "@/components/marketplace/LoadMore";

function HomePageContent() {
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<Awaited<ReturnType<typeof compareAdminVsHomepage>> | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

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
        console.log("⚠️ No posts found, running comprehensive diagnostic...");
        const comparison = await compareAdminVsHomepage();
        
        setDiagnosticResults(comparison);
        setShowDiagnostic(true);
      }
      
      setPosts(fetchedPosts);
      console.log(`✅ Loaded ${fetchedPosts.length} posts from Supabase`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      console.error("❌ Failed to load posts:", err);
      
      // Run diagnostic on error
      const comparison = await compareAdminVsHomepage();
      
      setDiagnosticResults(comparison);
      setShowDiagnostic(true);
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
              onClick={loadPosts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowDiagnostic(!showDiagnostic)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showDiagnostic ? "Hide" : "Show"} Diagnostic
            </button>
          </div>
          
          {showDiagnostic && diagnosticResults && (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg text-left">
              <h3 className="text-lg font-bold mb-4">🔍 Admin vs Homepage Diagnostic Results</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Environment:</strong> {diagnosticResults.environment}</div>
                <div><strong>Supabase URL:</strong> {diagnosticResults.supabaseUrl}</div>
                <div><strong>Anon Key Length:</strong> {diagnosticResults.anonKeyLength}</div>
                <div><strong>Service Key Length:</strong> {diagnosticResults.serviceKeyLength}</div>
                
                <div className="mt-4 font-bold">🌐 HOMEPAGE (Anon Key):</div>
                <div><strong>Connection:</strong> {diagnosticResults.homepageConnection ? "✅ Success" : "❌ Failed"}</div>
                <div><strong>Total Posts:</strong> {diagnosticResults.homepageTotalPosts}</div>
                <div><strong>Approved Posts:</strong> {diagnosticResults.homepageApprovedPosts}</div>
                
                <div className="mt-4 font-bold">🔧 ADMIN (Service Role):</div>
                <div><strong>Connection:</strong> {diagnosticResults.adminConnection ? "✅ Success" : "❌ Failed"}</div>
                <div><strong>Total Posts:</strong> {diagnosticResults.adminTotalPosts}</div>
                <div><strong>Approved Posts:</strong> {diagnosticResults.adminApprovedPosts}</div>
                
                <div className="mt-4 p-3 bg-yellow-100 rounded">
                  <strong>🎯 DIAGNOSIS:</strong> {diagnosticResults.diagnosis}
                </div>
                
                {(diagnosticResults.homepageErrors.length > 0 || diagnosticResults.adminErrors.length > 0) && (
                  <div className="mt-4">
                    <strong>Errors:</strong>
                    <div className="space-y-2">
                      {diagnosticResults.homepageErrors.length > 0 && (
                        <div>
                          <strong>Homepage:</strong>
                          <ul className="list-disc list-inside text-red-600 ml-4">
                            {diagnosticResults.homepageErrors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {diagnosticResults.adminErrors.length > 0 && (
                        <div>
                          <strong>Admin:</strong>
                          <ul className="list-disc list-inside text-red-600 ml-4">
                            {diagnosticResults.adminErrors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {(diagnosticResults.homepageSamplePosts.length > 0 || diagnosticResults.adminSamplePosts.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {diagnosticResults.homepageSamplePosts.length > 0 && (
                      <div>
                        <strong>Homepage Sample:</strong>
                        <pre className="bg-white p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(diagnosticResults.homepageSamplePosts, null, 2)}
                        </pre>
                      </div>
                    )}
                    {diagnosticResults.adminSamplePosts.length > 0 && (
                      <div>
                        <strong>Admin Sample:</strong>
                        <pre className="bg-white p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(diagnosticResults.adminSamplePosts, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
          
          {showDiagnostic && diagnosticResults && (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-bold mb-4">🔍 Supabase Diagnostic Results</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Environment:</strong> {diagnosticResults.environment}</div>
                <div><strong>Supabase URL:</strong> {diagnosticResults.supabaseUrl}</div>
                <div><strong>Total Posts:</strong> {diagnosticResults.homepageTotalPosts}</div>
                <div><strong>Approved Posts:</strong> {diagnosticResults.homepageApprovedPosts}</div>
                <div><strong>Diagnosis:</strong> {diagnosticResults.diagnosis}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show posts
  return (
    <div className="min-h-screen bg-gray-50">
      {showDiagnostic && diagnosticResults && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="max-w-7xl mx-auto text-sm text-blue-800">
            🔍 <strong>Diagnostic Active:</strong> {diagnosticResults.diagnosis} | 
            <button 
              onClick={() => setShowDiagnostic(false)}
              className="ml-2 underline"
            >
              Hide
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {showDiagnostic ? "Hide" : "Show"} Diagnostic
          </button>
        </div>
        
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

        {filteredPosts.length >= 6 && (
          <LoadMore 
            hasMore={false}
            isLoading={false}
            onLoadMore={() => {}}
          />
        )}
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
