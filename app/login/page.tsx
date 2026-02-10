"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/session";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Shared loading component to eliminate duplication
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </CardContent>
    </Card>
  </div>
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supabaseSubmitting, setSupabaseSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [supabaseEmail, setSupabaseEmail] = useState("kishoriraut369@gmail.com");
  const [supabasePassword, setSupabasePassword] = useState("admin123k");
  const [error, setError] = useState("");
  const [supabaseError, setSupabaseError] = useState("");
  const [message, setMessage] = useState("");
  const [supabaseMessage, setSupabaseMessage] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is already logged in via localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          // User is already logged in, redirect to intended destination
          const redirectTo = searchParams.get('redirect');
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push('/admin/requests');
          }
          return;
        }

        // Also check Supabase auth
        if (supabaseClient) {
          const { data: { user } } = await supabaseClient.auth.getUser();
          if (user?.email === 'kishoriraut369@gmail.com') {
            const redirectTo = searchParams.get('redirect');
            if (redirectTo) {
              router.push(redirectTo);
            } else {
              router.push('/admin/requests');
            }
            return;
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Set session in localStorage and cookie
        setSession(data.user);
        
        setMessage("Login successful! Redirecting...");
        
        // Redirect immediately without delay
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/admin/requests');
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSubmitting(true);
    setSupabaseError("");

    try {
      if (!supabaseClient) {
        setSupabaseError("Supabase client not available");
        return;
      }

      // Use email/password authentication
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: supabaseEmail,
        password: supabasePassword,
      });

      if (error) {
        setSupabaseError(error.message);
        return;
      }

      if (data.user) {
        // Check if user is admin
        if (data.user.email === 'kishoriraut369@gmail.com') {
          setSupabaseMessage("Login successful! Redirecting to admin...");
          
          // Redirect to admin
          const redirectTo = searchParams.get('redirect');
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo);
            } else {
              router.push('/admin/requests');
            }
          }, 1000);
        } else {
          setSupabaseError("Access denied. Admin privileges required.");
          await supabaseClient.auth.signOut();
        }
      }
    } catch (error) {
      console.error("Supabase login error:", error);
      setSupabaseError("Login failed. Please try again.");
    } finally {
      setSupabaseSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">CityMaid Admin</CardTitle>
          <CardDescription>Sign in to manage your marketplace</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="supabase" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supabase">Supabase Auth</TabsTrigger>
              <TabsTrigger value="legacy">Legacy Login</TabsTrigger>
            </TabsList>

            <TabsContent value="supabase" className="space-y-4">
              {supabaseMessage && (
                <Alert className="mb-6">
                  <AlertDescription className="text-green-800">{supabaseMessage}</AlertDescription>
                </Alert>
              )}

              {supabaseError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{supabaseError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-email">Admin Email</Label>
                  <Input
                    id="supabase-email"
                    type="email"
                    value={supabaseEmail}
                    onChange={(e) => setSupabaseEmail(e.target.value)}
                    required
                    placeholder="kishoriraut369@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-password">Password</Label>
                  <Input
                    id="supabase-password"
                    type="password"
                    value={supabasePassword}
                    onChange={(e) => setSupabasePassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  onClick={handleSupabaseLogin}
                  disabled={supabaseSubmitting}
                  className="w-full"
                >
                  {supabaseSubmitting ? "Signing in..." : "Sign in with Supabase"}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  <p>Recommended: Use Supabase authentication for better security</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legacy" className="space-y-4">
              {message && (
                <Alert className="mb-6">
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@citymaid.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                <p>Legacy login system (limited functionality)</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Listings
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Admin access only. Contact support if you need login credentials.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  );
}
