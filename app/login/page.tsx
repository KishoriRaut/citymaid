"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSession, type User } from "@/lib/session";
import { isValidEmail } from "@/lib/validation";
import { Spinner } from "@/components/ui/spinner";
import { fetchWithTimeout, parseJSONResponse, handleAPIError } from "@/lib/api";
import { appConfig } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailError("");
    setPasswordError("");

    // Client-side email validation
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchWithTimeout("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        timeout: 30000, // 30 seconds
      });

      let data: { error?: string; errorType?: string; user?: User; message?: string };
      try {
        data = await parseJSONResponse<{ error?: string; errorType?: string; user?: User; message?: string }>(response);
      } catch {
        setError(`Sign in failed: ${response.status} ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = data?.error || `Sign in failed: ${response.status}`;
        const errorType = data?.errorType || "general";
        
        if (process.env.NODE_ENV === "development") {
          console.error("Signin API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            errorType: errorType,
            fullResponse: data,
          });
        }

        // Set field-specific errors
        if (errorType === "email") {
          setEmailError(errorMessage);
        } else if (errorType === "password") {
          setPasswordError(errorMessage);
        } else {
          setError(errorMessage);
        }
        
        setIsLoading(false);
        return;
      }

      // Store user data in session
      if (data.user) {
        setSession(data.user);
      }

      // Reset form
      setEmail("");
      setPassword("");

      // Redirect immediately to admin dashboard after successful login
      router.push(appConfig.routes.admin);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                  setError("");
                }}
                className={`w-full rounded-md border bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  emailError
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input hover:border-ring"
                }`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <svg
                    className="h-3 w-3"
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
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  setError("");
                }}
                className={`w-full rounded-md border bg-background px-3 py-2.5 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  passwordError
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input hover:border-ring"
                }`}
                placeholder="Enter your password"
              />
              {passwordError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <svg
                    className="h-3 w-3"
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
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>

            {error && !emailError && !passwordError && (
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Admin access only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
