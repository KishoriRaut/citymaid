"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/button";
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

export default function PostPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Check if this is a contact unlock payment
  const unlockRequestId = searchParams.get('unlock_request');
  const isContactUnlock = !!unlockRequestId;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload an image (JPG, PNG) or PDF file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      setPaymentProof(file);
      setError(null);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProof && !transactionId.trim()) {
      setError("Please provide either a payment proof file or transaction ID");
      return;
    }

    if (!post) return;

    setIsSubmitting(true);
    try {
      const visitorId = getOrCreateVisitorId();
      
      if (isContactUnlock && unlockRequestId) {
        // Handle contact unlock payment
        const base64String = paymentProof ? await fileToBase64(paymentProof) : '';
        
        const formData = new FormData();
        formData.append('requestId', unlockRequestId);
        formData.append('type', 'contact_unlock');
        formData.append('paymentProofBase64', base64String);
        formData.append('fileName', paymentProof?.name || '');
        formData.append('fileType', paymentProof?.type || '');
        formData.append('transactionId', transactionId.trim());

        const response = await fetch('/api/unified-payment', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit payment');
        }

        const result = await response.json();
        if (result.success) {
          setShowConfirmation(true);
        } else {
          setError(result.error || 'Failed to submit payment');
        }
      } else {
        // Handle post promotion payment (existing logic)
        const paymentProofUrl = paymentProof 
          ? `payment_proof_${post.id}_${visitorId}_${Date.now()}.${paymentProof.type.split('/')[1]}`
          : `transaction_${post.id}_${transactionId}_${Date.now()}`;

        console.log("Submitting payment proof:", {
          postId: post.id,
          paymentProofUrl,
          visitorId,
          hasFile: !!paymentProof,
          transactionId
        });

        const { success, error } = await updateHomepagePaymentProof(
          post.id,
          paymentProofUrl
        );

        console.log("Payment proof submission result:", { success, error });

        if (success) {
          setShowConfirmation(true);
        } else {
          setError(`Failed to submit payment proof: ${error}`);
        }
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      setError(`Failed to submit payment proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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

  if (error && !showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Proof Received!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm mb-2">
                <strong>✅ Your payment proof has been received.</strong>
              </p>
              <p className="text-green-800 text-sm mb-2">
                <strong>⏰ Approval usually takes 2-4 hours.</strong>
              </p>
              {isContactUnlock ? (
                <p className="text-green-800 text-sm">
                  <strong>📞 Once approved, you&apos;ll be able to view the contact information for this post.</strong>
                </p>
              ) : (
                <p className="text-green-800 text-sm">
                  <strong>🏠 Once approved, your post will be displayed on the homepage for 30 days.</strong>
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Back to Listings
              </Button>
              <Button 
                onClick={() => router.push(`/post/${post?.id}`)} 
                variant="outline"
                className="w-full"
              >
                View My Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't allow if already pending or approved
  if (post?.homepage_payment_status === 'pending' || post?.homepage_payment_status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {post?.homepage_payment_status === 'pending' ? 'Payment Pending' : 'Already Approved'}
          </h2>
          <p className="text-gray-600 mb-4">
            {post?.homepage_payment_status === 'pending' 
              ? 'Your homepage feature payment is currently under review.'
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isContactUnlock ? 'Unlock Contact Information' : 'Feature Your Post on Homepage'}
              </h1>
              <p className="text-gray-600">
                {isContactUnlock ? 'Get contact details for this job opportunity' : 'Get maximum visibility for your post'}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{post?.title || `${post?.work} - ${post?.place}`}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Work:</span> {post?.work}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {post?.place}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {post?.salary}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {post?.post_type === 'employer' ? 'Hiring' : 'Job Seeker'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>{isContactUnlock ? 'Contact Unlock Fee:' : 'Homepage Feature Fee:'}</strong> 
                    {isContactUnlock ? ' Get contact details for this job opportunity.' : ' Get your post displayed prominently on the homepage for 30 days.'}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Price:</strong> NPR 299
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Scan QR Code</h4>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-48 h-48 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src="/sanima-qr.png" 
                          alt="Sanima Bank QR Code" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-gray-500 text-sm">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <p>QR Code</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Scan with Sanima Bank app</p>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Instructions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ol className="text-sm text-gray-700 space-y-2">
                        <li>1. Scan the QR code with Sanima Bank app</li>
                        <li>2. Enter amount: NPR 500</li>
                        <li>3. Complete the payment</li>
                        <li>4. Save the transaction ID or screenshot</li>
                        <li>5. Upload payment proof below</li>
                      </ol>
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>Bank:</strong> Sanima Bank
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Payment Proof</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="payment-proof" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Payment Proof (Screenshot or Receipt)
                    </label>
                    <input
                      id="payment-proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-2">
                      OR Enter Transaction ID
                    </label>
                    <input
                      id="transaction-id"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleSubmitPaymentProof}
                  disabled={isSubmitting || (!paymentProof && !transactionId.trim())}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
