"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, clearSession, type User } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { appConfig } from "@/lib/config";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push(appConfig.routes.login);
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push(appConfig.routes.login);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-48" />
              <Skeleton className="h-5 sm:h-6 w-64" />
            </div>
            <Skeleton className="h-10 w-full sm:w-20" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">Welcome back, {user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
            Logout
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-2">Account Information</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="break-words">
                <span className="font-medium text-foreground">Email:</span> {user.email}
              </p>
              <p className="break-all">
                <span className="font-medium text-foreground">User ID:</span> <span className="text-xs sm:text-sm">{user.id}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Member since:</span>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-2">Quick Actions</h2>
            <div className="space-y-2">
              <Link href={appConfig.routes.adminProfile} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                <Button variant="outline" className="w-full justify-start min-h-[44px] sm:min-h-0">
                  View Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start min-h-[44px] sm:min-h-0" disabled>
                Settings
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1 transition-shadow duration-200 hover:shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-2">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              Your recent activity will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
