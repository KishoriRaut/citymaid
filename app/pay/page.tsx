"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { useToast } from "@/components/shared/toast";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToast } = useToast();

  // Get parameters from URL query string
  const type = searchParams.get('type');
  const requestId = searchParams.get('id');

  useEffect(() => {
    if (type && requestId) {
      setLoading(false);
    } else {
      setError("Invalid payment request URL. Missing type or id parameter.");
      setLoading(false);
    }
  }, [type, requestId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    if (!type || !requestId) {
      setError("Invalid payment request");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const base64String = await fileToBase64(paymentProof);
      
      const formData = new FormData();
      formData.append('requestId', requestId);
      formData.append('type', type);
      formData.append('paymentProofBase64', base64String);
      formData.append('fileName', paymentProof.name);
      formData.append('fileType', paymentProof.type);
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
        setShowSuccess(true);
        addToast("Payment submitted successfully! Our team will verify it within 24 hours.", "success", 5000);
      } else {
        setError(result.error || 'Failed to submit payment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit payment';
      setError(errorMessage);
      addToast(errorMessage, "error", 3000);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading payment details...</h2>
        </div>
      </div>
    );
  }

  if (error && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Request Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    const isPostPromotion = type === 'post_promotion';
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h1>
              
              <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">
                  {isPostPromotion ? '📢 Post Publishing Information' : '📞 Contact Information'}
                </h2>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Next Steps:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Our admin team will verify your payment within 24 hours</li>
                    <li>Once approved, {isPostPromotion ? 'your post will be published on homepage' : 'contact information will be available'}</li>
                    <li>You can check the status anytime on this page</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Request ID:</strong> {requestId}<br />
                  <strong>Payment Type:</strong> {isPostPromotion ? 'Homepage Post (Rs. 299)' : 'Contact Unlock (Rs. 299)'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/pay?type=${type}&id=${requestId}`)}
                  className="w-full"
                >
                  View Payment Status
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

  const isPostPromotion = type === 'post_promotion';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isPostPromotion ? 'Homepage Post Payment' : 'Contact Unlock Payment'}
            </h1>
            <p className="text-gray-600">
              {isPostPromotion 
                ? 'Publish your post on homepage after payment verification and admin approval'
                : 'Unlock contact information for this job after payment verification'
              }
            </p>
          </div>

          {/* Payment Form */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Information</h2>
              <p className="text-sm text-gray-600">Complete your payment to proceed with the request</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Payment Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-blue-800 text-sm font-medium mb-4">
                        <strong>Amount:</strong> Rs. 299<br />
                        <strong>Payment Method:</strong> Bank Transfer, ESEWA, Khalti<br />
                        <strong>Processing Time:</strong> Within 24 hours
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-center text-sm font-medium text-gray-700 mb-3">Scan QR Code for Payment</p>
                      <div className="flex justify-center">
                        <img 
                          src="/sanima-qr.png" 
                          alt="Payment QR Code" 
                          className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                        />
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">
                        Scan with ESEWA, Khalti, or banking app
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
                    placeholder="Enter your transaction ID"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Transaction ID from your payment confirmation</p>
                </div>

                {/* Payment Proof */}
                <div>
                  <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="paymentProof"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                {paymentProof && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Selected file:</strong> {paymentProof.name} ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="mt-8 flex gap-3">
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

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact us at support@citymaid.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
