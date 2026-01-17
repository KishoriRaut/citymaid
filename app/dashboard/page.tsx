"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, clearSession, type User } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Redirect to login if not logged in
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Account Information</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium text-foreground">User ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium text-foreground">Member since:</span>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start">
                  View Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                Settings
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              Your recent activity will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
