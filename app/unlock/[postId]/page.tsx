"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { getPostById } from "@/lib/posts";
import { maskContact } from "@/lib/utils";
import { createPayment } from "@/lib/payments";
import type { Post } from "@/lib/types";

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
          <div className="text-center">Loading...</div>
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

  const maskedContact = maskContact(post.contact);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Unlock Contact</h1>

        {/* Post Summary */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="mb-4">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                post.post_type === "employer"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {post.post_type === "employer" ? "Hiring" : "Looking for Work"}
            </span>
          </div>

          {post.photo_url && (
            <div className="relative h-64 w-full mb-4 rounded-md overflow-hidden bg-muted">
              <img
                src={post.photo_url}
                alt={post.work}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{post.work}</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Time:</span> {post.time}
              </p>
              <p>
                <span className="font-medium">Place:</span> {post.place}
              </p>
              <p>
                <span className="font-medium">Salary:</span> {post.salary}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                <span className="font-mono">{maskedContact}</span>
              </p>
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
