"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { getPostById } from "@/lib/posts";
import { maskContact } from "@/lib/utils";
import { createPayment } from "@/lib/payments";
import type { Post } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const PAYMENT_METHODS = [
  { value: "qr", label: "QR Code" },
  { value: "esewa", label: "eSewa" },
  { value: "bank", label: "Bank Transfer" },
];

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    method: "esewa" as "qr" | "esewa" | "bank",
    reference_id: "",
  });

  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Get or create visitor ID
    if (typeof window !== "undefined") {
      let vid = localStorage.getItem("citymaid_visitor_id");
      if (!vid) {
        vid = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem("citymaid_visitor_id", vid);
      }
      setVisitorId(vid);
    }

    // Load post
    const loadPost = async () => {
      try {
        // For public access, we need to get post via API route
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setPost(data.post);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post");
        setIsLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!visitorId) {
        setError("Visitor ID not found");
        setIsSubmitting(false);
        return;
      }

      const { payment, error: paymentError } = await createPayment({
        post_id: postId,
        visitor_id: visitorId,
        method: formData.method,
        reference_id: formData.reference_id || undefined,
      });

      if (paymentError || !payment) {
        setError(paymentError || "Failed to submit payment");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error submitting payment:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="rounded-lg border bg-card p-6 mb-6">
            <Skeleton className="h-64 w-full mb-4 rounded-lg" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">{error}</div>
          <Button onClick={() => router.push(appConfig.routes.home)} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // Contact is already masked from SQL if payment not approved
  // If it contains asterisks, it's already masked; otherwise mask it client-side as fallback
  const maskedContact = post.contact 
    ? (post.contact.includes("*") ? post.contact : maskContact(post.contact))
    : "****";

  const isHiring = post.post_type === "employer";

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Unlock Contact</h1>

        {/* Post Summary */}
        <div className="rounded-xl border bg-card p-6 mb-6 shadow-sm">
          {/* Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                isHiring
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {isHiring ? "HIRE A WORKER" : "FIND A JOB"}
            </span>
          </div>

          {/* Photo Section - Enhanced */}
          <div className="relative w-full mb-6 rounded-lg overflow-hidden bg-muted aspect-[16/9] flex items-center justify-center shadow-md">
            {isHiring ? (
              // Employer posts: Always show briefcase icon
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <svg
                  className="w-16 h-16 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm mt-3 opacity-75 font-medium">No photo</p>
              </div>
            ) : post.photo_url && !imageError ? (
              // Employee posts: Show photo if available
              <img
                src={post.photo_url}
                alt={post.work}
                className="w-full h-full object-cover"
                loading="eager"
                onError={() => setImageError(true)}
              />
            ) : (
              // Employee posts: Show user icon if no photo or error
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <svg
                  className="w-16 h-16 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm mt-3 opacity-75 font-medium">No photo available</p>
              </div>
            )}
          </div>

          {/* Post Details */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{post.work}</h2>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Time */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg
                  className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
                  <p className="text-sm font-semibold text-foreground">{post.time}</p>
                </div>
              </div>

              {/* Place */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg
                  className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-foreground">{post.place}</p>
                </div>
              </div>

              {/* Salary */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg
                  className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Salary</p>
                  <p className="text-sm font-semibold text-foreground">{post.salary}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border-2 border-dashed">
                <svg
                  className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                  <p className="text-base font-mono font-semibold text-foreground">{maskedContact}</p>
                  <p className="text-xs text-muted-foreground mt-1">🔒 Locked - Unlock after payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {success ? (
          <div className="rounded-lg border bg-green-50 dark:bg-green-900/20 p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
              Payment Submitted!
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your payment request has been submitted. The contact will be unlocked after
              verification.
            </p>
            <Button onClick={() => router.push(appConfig.routes.home)}>Go Home</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Amount: <span className="font-semibold">Rs. 3,000</span>
              </p>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value as "qr" | "esewa" | "bank" })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reference ID / Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.reference_id}
                  onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                  placeholder="Enter your payment reference"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the transaction ID or reference number from your payment
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(appConfig.routes.home)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Payment"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
