"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type User } from "@/lib/session";
import { isAdminUser } from "@/lib/auth-utils";
import { getAllPosts } from "@/lib/posts";
import { getAllPayments } from "@/lib/payments";
import { appConfig } from "@/lib/config";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { Skeleton } from "@/components/shared/skeleton";
import { FileText, DollarSign, CheckCircle, Eye, User as UserIcon, Plus, BarChart3, Edit } from "lucide-react";

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
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/admin/login");
      return;
    }

    // Check if user is admin
    if (!isAdminUser(currentUser.email)) {
      router.push("/");
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
    loadMetrics();
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
            icon={<FileText className="w-6 h-6" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Pending Payments"
            value={metrics.pendingPayments}
            icon={<DollarSign className="w-6 h-6" />}
            status="pending"
            loading={metricsLoading}
          />
          <MetricCard
            title="Approved Posts"
            value={metrics.approvedPosts}
            icon={<CheckCircle className="w-6 h-6" />}
            status="approved"
            loading={metricsLoading}
          />
          <MetricCard
            title="Hidden Posts"
            value={metrics.hiddenPosts}
            icon={<Eye className="w-6 h-6" />}
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
              icon={<UserIcon className="w-5 h-5" />}
            />
            <QuickActionCard
              title="Create Post"
              description="Create a new marketplace post"
              href={appConfig.routes.post}
              icon={<Plus className="w-5 h-5" />}
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
              icon={<Edit className="w-5 h-5" />}
            />
            <QuickActionCard
              title="Revenue Dashboard"
              description="Manage all transactions and revenue in one unified interface. View contact unlock and homepage feature payments together."
              href="/admin/revenue"
              icon={<BarChart3 className="w-5 h-5" />}
            />
          </div>
        </div>
      </main>

    </div>
  );
}
