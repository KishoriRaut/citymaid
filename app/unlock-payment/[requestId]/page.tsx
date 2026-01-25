"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { getUnlockRequestById, updateUnlockRequestPayment } from "@/lib/unlock-requests";

interface UnlockRequest {
  id: string;
  post_id: string;
  visitor_id: string;
  status: 'pending' | 'paid' | 'approved' | 'rejected';
  payment_proof: string | null;
  created_at: string;
  updated_at: string;
  posts?: {
    title: string;
    contact: string;
    description?: string;
  };
  users?: {
    email: string;
  };
}

export default function UnlockPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<UnlockRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.requestId) {
      loadUnlockRequest(params.requestId as string);
    }
  }, [params.requestId]);

  const loadUnlockRequest = async (id: string) => {
    setLoading(true);
    try {
      const { request: data, error } = await getUnlockRequestById(id);
      
      if (error) {
        setError(error);
      } else if (data) {
        setRequest(data);
        // If already paid, show success message
        if (data.status === 'paid' || data.status === 'approved') {
          setShowSuccess(true);
        }
      } else {
        setError("Unlock request not found");
      }
    } catch (error) {
      console.error("Error loading unlock request:", error);
      setError("Failed to load unlock request");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setPaymentProof(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentProof) {
      setError("Please upload payment proof");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter transaction ID");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload payment proof and update request
      const result = await updateUnlockRequestPayment(
        request!.id,
        paymentProof,
        transactionId.trim()
      );

      if (result.success) {
        setShowSuccess(true);
      } else {
        setError(result.error || 'Failed to submit payment');
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      setError('Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading payment details...</h2>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="text-green-600 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h1>
              
              <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">📞 Contact Delivery Information</h2>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Next Steps:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Our admin team will verify your payment within 24 hours</li>
                    <li>Once approved, you&apos;ll receive the contact information</li>
                    <li>You can check the status anytime in your unlock requests</li>
                  </ol>
                  <p className="mt-3"><strong>How you&apos;ll receive the contact:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Contact number will appear on this page after approval</li>
                    <li>You&apos;ll also receive an email notification</li>
                    <li>The contact will be permanently available in your account</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Request ID:</strong> {request?.id}<br />
                  <strong>Post:</strong> {request?.posts?.title || 'N/A'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/unlock/${request?.id}`)}
                  className="w-full"
                >
                  View Request Status
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Browse More Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlock Contact Payment</h1>
              <p className="text-gray-600">Complete the payment to unlock contact information</p>
            </div>

            {/* Post Details */}
            {request?.posts && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Title</p>
                    <p className="text-gray-900">{request.posts?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-gray-900">{request.posts?.description || 'No description available'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Payment Details:</strong><br />
                    • Amount: Rs. 50<br />
                    • Payment Method: Bank Transfer, ESEWA, Khalti<br />
                    • Upload payment proof below
                  </p>
                </div>

                {/* Transaction ID */}
                <div className="mb-4">
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your transaction ID"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof * (Screenshot or Receipt)
                  </label>
                  <input
                    type="file"
                    id="paymentProof"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                {paymentProof && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      Selected file: {paymentProof.name} ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/")}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
