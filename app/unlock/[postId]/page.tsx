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
import { CONTACT_UNLOCK_PRICE, getContactUnlockPriceFormatted } from "@/lib/pricing";

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
  const [qrCodeError, setQrCodeError] = useState(false);

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
        amount: CONTACT_UNLOCK_PRICE,
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
          <Button onClick={() => router.push(appConfig.routes.home)} size="lg" className="mt-4">
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Unlock Contact</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          You are paying {getContactUnlockPriceFormatted()} to unlock one verified contact number.
          <br />
          This fee helps keep the platform safe for workers.
        </p>

        {/* Post Summary */}
        <div className="rounded-xl border border-border/50 bg-card p-6 mb-8 shadow-sm">
          {/* Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide ${
                isHiring
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent"
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
          <div className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-tight">{post.work}</h2>
            
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border-2 border-dashed border-border/50">
                <svg
                  className="w-5 h-5 text-muted-foreground/70 mt-0.5 flex-shrink-0"
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
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
              Payment Submitted!
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-5 leading-relaxed">
              Your payment request has been submitted. The contact will be unlocked after
              verification.
            </p>
            <Button onClick={() => router.push(appConfig.routes.home)} size="lg" className="shadow-sm hover:shadow transition-shadow duration-200">
              Go Home
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-1 text-foreground">Payment Information</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Amount: <span className="font-semibold text-foreground">{getContactUnlockPriceFormatted()}</span>
              </p>

              {/* Payment Method */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2.5 text-foreground">Payment Method</label>
                <select
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value as "qr" | "esewa" | "bank" })
                  }
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
                  required
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Details Based on Method */}
              <div className="mb-5 p-4 rounded-lg bg-muted/30 border border-border/50">
                {formData.method === "qr" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Scan QR Code to Pay</h3>
                    <div className="flex justify-center">
                      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-lg border-2 border-dashed border-border bg-background flex items-center justify-center overflow-hidden p-4 sm:p-6">
                        {/* QR Code Image - Add your QR code image to public/qr-code.png */}
                        {qrCodeError ? (
                          <div className="text-center p-6 w-full">
                            <svg
                              className="w-16 h-16 mx-auto text-muted-foreground mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                              />
                            </svg>
                            <p className="text-sm text-muted-foreground">QR Code image not found</p>
                            <p className="text-xs text-muted-foreground mt-1">Add qr-code.png to public folder</p>
                          </div>
                        ) : (
                          <img
                            src="/qr-code.png"
                            alt={`Payment QR Code - Scan to pay ${getContactUnlockPriceFormatted()}`}
                            className="w-full min-w-[280px] sm:min-w-[320px] md:min-w-[400px] max-w-[500px] aspect-square object-contain"
                            onError={() => setQrCodeError(true)}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-center text-muted-foreground mt-3 leading-relaxed">
                      Scan this QR code with your mobile banking app or eSewa to pay {getContactUnlockPriceFormatted()}
                    </p>
                  </div>
                )}

                {formData.method === "esewa" && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground mb-2">eSewa Payment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground min-w-[100px]">eSewa ID:</span>
                        <span className="font-semibold text-foreground">+9779841317273</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Send {getContactUnlockPriceFormatted()} to the eSewa ID above. After payment, enter the transaction ID below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.method === "bank" && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-muted-foreground min-w-[120px]">A/C Holder:</span>
                        <span className="font-semibold text-foreground">CITY MAID SERVICES (PVT).LTD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground min-w-[120px]">Account Number:</span>
                        <span className="font-semibold text-foreground font-mono">005010010001200</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground min-w-[120px]">Bank Name:</span>
                        <span className="font-semibold text-foreground">Sanima Bank Limited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground min-w-[120px]">Branch:</span>
                        <span className="font-semibold text-foreground">KUMARIPATI BRANCH</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Transfer {getContactUnlockPriceFormatted()} to the account above. After transfer, enter the transaction reference below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference ID */}
              <div>
                <label className="block text-sm font-semibold mb-2.5 text-foreground">
                  Reference ID / Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.reference_id}
                  onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                  placeholder="Enter your payment reference"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  required
                />
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Enter the transaction ID or reference number from your payment
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(appConfig.routes.home)}
                className="flex-1 border-border hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg" className="flex-1 shadow-sm hover:shadow transition-shadow duration-200">
                {isSubmitting ? "Submitting..." : "Submit Payment"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
