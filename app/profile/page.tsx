"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setSession, type User } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/validation";
import { useAuth } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { fetchWithTimeout, parseJSONResponse, handleAPIError } from "@/lib/api";

interface ProfileUser extends User {
  updated_at?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication - redirects if not logged in
  const currentUser = useAuth("/login");
  
  useEffect(() => {
    if (!currentUser) {
      return; // Will redirect via useAuth
    }

    // Set initial user data from localStorage immediately so page shows right away
    setUser(currentUser);
    setEmail(currentUser.email);
    setIsLoading(false);
    
    // Fetch fresh data from API using userId in the background
    const fetchProfileData = async (userId: string) => {
      try {
        const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (!response.ok) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to fetch profile:", data.error);
          }
          return;
        }

        if (data.user) {
          setUser(data.user);
          setEmail(data.user.email);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching profile:", err);
        }
      }
    };

    fetchProfileData(currentUser.id);
  }, [router, currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEmail(user.email);
    }
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (email === user.email) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetchWithTimeout("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: email,
        }),
        timeout: 30000,
      });

      const data = await parseJSONResponse<{ error?: string; user?: ProfileUser; message?: string }>(response);

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Update local session
      if (data.user) {
        setSession(data.user);
        setUser(data.user);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 sm:h-10 w-48 mb-6 sm:mb-8" />
          <div className="rounded-lg border bg-card p-4 sm:p-6 lg:p-8 shadow-sm space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="min-h-[44px] sm:min-h-0 transition-all duration-200"
            >
              <span className="hidden sm:inline">← </span>Back to Dashboard
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border bg-card p-4 sm:p-6 lg:p-8 shadow-sm space-y-5 sm:space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-sm text-green-800 dark:text-green-200 flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email Address
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-ring"
                  placeholder="you@example.com"
                  disabled={isSaving}
                />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* User ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              User ID
            </label>
            <p className="text-sm text-muted-foreground font-mono">
              {user.id}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Account Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Member Since
              </label>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {user.updated_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Last Updated
                </label>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Account Security</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For security reasons, password changes must be done through the login page.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/login")}
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
