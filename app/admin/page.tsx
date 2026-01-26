"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type User } from "@/lib/session";
import { getAllPosts } from "@/lib/posts";
import { getAllPayments } from "@/lib/payments";
import { appConfig } from "@/lib/config";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { Skeleton } from "@/components/shared/skeleton";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    pendingPayments: 0,
    approvedPosts: 0,
    hiddenPosts: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    // Temporarily bypass authentication for testing
    const mockUser = {
      id: "admin-123",
      email: "admin@test.com",
      role: "admin",
      created_at: new Date().toISOString()
    };
    setUser(mockUser);
    setIsLoading(false);
    loadMetrics();
    
    // Original authentication code (commented out for testing)
    /*
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/admin/login");
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
    loadMetrics();
    */
  }, [router]);

  const loadMetrics = async () => {
    try {
      setMetricsLoading(true);
      
      // Fetch all posts
      const { posts, error: postsError } = await getAllPosts();
      if (postsError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading posts metrics:", postsError);
        }
      } else {
        const totalPosts = posts.length;
        const approvedPosts = posts.filter((p) => p.status === "approved").length;
        const hiddenPosts = posts.filter((p) => p.status === "hidden").length;

        setMetrics((prev) => ({
          ...prev,
          totalPosts,
          approvedPosts,
          hiddenPosts,
        }));
      }

      // Fetch all payments
      const { payments, error: paymentsError } = await getAllPayments();
      if (paymentsError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading payments metrics:", paymentsError);
        }
      } else {
        const pendingPayments = payments.filter((p) => p.status === "pending").length;
        setMetrics((prev) => ({
          ...prev,
          pendingPayments,
        }));
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading metrics:", error);
      }
    } finally {
      setMetricsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.email}</h1>
          <p className="text-muted-foreground">Manage your marketplace from here</p>
        </div>

        {/* Metrics Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Posts"
            value={metrics.totalPosts}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            loading={metricsLoading}
          />
          <MetricCard
            title="Pending Payments"
            value={metrics.pendingPayments}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            status="pending"
            loading={metricsLoading}
          />
          <MetricCard
            title="Approved Posts"
            value={metrics.approvedPosts}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            status="approved"
            loading={metricsLoading}
          />
          <MetricCard
            title="Hidden Posts"
            value={metrics.hiddenPosts}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            }
            status="hidden"
            loading={metricsLoading}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActionCard
              title="View Profile"
              description="Manage your account settings and information"
              href={appConfig.routes.adminProfile}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <QuickActionCard
              title="Create Post"
              description="Create a new marketplace post"
              href={appConfig.routes.post}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Management Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Management</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActionCard
              title="Posts Management"
              description="View and manage all marketplace posts. Approve pending posts, hide or delete as needed."
              href={appConfig.routes.adminPosts}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <QuickActionCard
              title="Revenue Dashboard"
              description="Manage all transactions and revenue in one unified interface. View contact unlock and homepage feature payments together."
              href="/admin/revenue"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>
      </main>

    </div>
  );
}
