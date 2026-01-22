"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import { Spinner } from "@/components/ui/spinner";
import { fetchWithTimeout, parseJSONResponse, handleAPIError } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchWithTimeout("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        timeout: 30000, // 30 seconds
      });

      let data: { error?: string; message?: string; user?: { id: string; email: string; created_at: string } };
      try {
        data = await parseJSONResponse<{ error?: string; message?: string; user?: { id: string; email: string; created_at: string } }>(response);
      } catch {
        setError(`Sign up failed: ${response.status} ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = data?.error || `Sign up failed: ${response.status}`;
        if (process.env.NODE_ENV === "development") {
          console.error("Signup API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            fullResponse: data,
          });
        }
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login page after successful signup
      // Note: Public signup is disabled - this is admin-only
      router.push("/login");
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to get started
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-ring"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-ring"
                placeholder="Create a password"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-ring"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-muted-foreground"
              >
                I agree to the{" "}
                <button
                  type="button"
                  className="text-primary hover:underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-primary hover:underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
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
            <Button type="submit" className="w-full min-h-[44px] sm:min-h-0" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Admin accounts are created by administrators only.</span>
            <div className="mt-2">
              <Link href="/login" className="font-medium text-primary hover:underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
