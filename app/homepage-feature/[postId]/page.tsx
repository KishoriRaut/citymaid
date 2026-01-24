"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateHomepagePaymentProof } from "@/lib/homepage-payments";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

interface Post {
  id: string;
  title: string;
  work: string;
  place: string;
  salary: string;
  post_type: string;
  status: string;
  homepage_payment_status: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function HomepageFeaturePage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.postId) {
      loadPost(params.postId as string);
    }
  }, [params.postId]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    try {
      // For now, we'll need to fetch post details
      // In a real implementation, you'd have a getPostById function
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.post) {
        setPost(data.post);
      } else {
        setError("Post not found");
      }
    } catch (error) {
      console.error("Error loading post:", error);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProof.trim()) {
      alert("Please provide payment proof information");
      return;
    }

    if (!post) return;

    setIsSubmitting(true);
    try {
      const visitorId = getOrCreateVisitorId();
      
      // Create a simple payment proof URL (in production, this would be a file upload)
      const paymentProofUrl = `payment_proof_${post.id}_${visitorId}_${Date.now()}`;

      const { success, error } = await updateHomepagePaymentProof(
        post.id,
        paymentProofUrl
      );

      if (success) {
        alert("Homepage feature request submitted! Your post will be reviewed for homepage display.");
        router.push("/");
      } else {
        alert(`Failed to submit request: ${error}`);
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      alert("Failed to submit payment proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading post details...</h2>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "This post doesn't exist or has been removed."}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Don't allow if already pending or approved
  if (post.homepage_payment_status === 'pending' || post.homepage_payment_status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {post.homepage_payment_status === 'pending' ? 'Request Pending' : 'Already Approved'}
          </h2>
          <p className="text-gray-600 mb-4">
            {post.homepage_payment_status === 'pending' 
              ? 'Your homepage feature request is currently under review.'
              : 'This post is already approved for homepage display.'
            }
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Request Homepage Feature</h1>
              <p className="text-gray-600">Get your post featured on the homepage for maximum visibility</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Work:</span> {post.work}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {post.place}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {post.salary}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {post.post_type}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Homepage Feature Fee:</strong> Get your post displayed prominently on the homepage for increased visibility and responses.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select 
                      id="payment-method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>eSewa</option>
                      <option>Bank Transfer</option>
                      <option>Khalti</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Proof (Transaction ID / Screenshot Reference)
                    </label>
                    <textarea
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter transaction ID, reference number, or describe your payment proof..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPaymentProof}
                  disabled={isSubmitting || !paymentProof.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
