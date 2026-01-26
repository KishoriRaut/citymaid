"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [postDetails, setPostDetails] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  // Get query parameters
  const type = searchParams.get('type');
  const paymentRequestId = searchParams.get('id');

  const fetchPaymentData = async () => {
    try {
      // Fetch payment request
      const paymentResponse = await fetch(`/api/payment-request/${paymentRequestId}`);
      if (!paymentResponse.ok) {
        throw new Error('Payment request not found');
      }
      
      const paymentData = await paymentResponse.json();

      // If post promotion, fetch post details
      if (type === 'post_promotion' && paymentData.postId) {
        const postResponse = await fetch(`/api/posts/${paymentData.postId}`);
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPostDetails(postData);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment details');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!type || !paymentRequestId) {
      setError("Invalid payment request URL");
      setLoading(false);
      return;
    }

    fetchPaymentData();
  }, [type, paymentRequestId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setPaymentProof(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      setError("Please enter transaction ID");
      return;
    }
    
    if (!paymentProof) {
      setError("Please upload payment proof");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const base64String = await fileToBase64(paymentProof);
      
      const formData = new FormData();
      formData.append('requestId', paymentRequestId || '');
      formData.append('type', type || '');
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
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to submit payment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit payment';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">Admin will verify your payment shortly.</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPostPromotion = type === 'post_promotion';
  const amount = 299; // Fixed amount

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPostPromotion ? 'Homepage Post Payment' : 'Contact Unlock Payment'}
          </h1>
          <p className="text-gray-600">
            {isPostPromotion 
              ? 'Complete payment to publish your post on homepage'
              : 'Complete payment to unlock contact information'
            }
          </p>
        </div>

        {/* Post Summary Card - Only for post promotion */}
        {isPostPromotion && postDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Post Summary</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Work Category</p>
                <p className="font-semibold text-gray-900">{postDetails.work}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-900">{postDetails.place}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-semibold text-gray-900">Rs. {postDetails.salary}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Work Time</p>
                <p className="font-semibold text-gray-900">{postDetails.time}</p>
              </div>
            </div>
            {postDetails.post_type === 'employee' && postDetails.photo_url && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Employee Photo</p>
                <img 
                  src={postDetails.photo_url} 
                  alt="Employee" 
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Payment Details</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900 mb-2">Rs. {amount}</p>
              <p className="text-sm text-blue-700">Fixed payment amount</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">Scan QR code to complete payment</p>
            <img 
              src="/sanima-qr.png" 
              alt="Payment QR Code" 
              className="w-32 h-32 mx-auto border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">Scan with ESEWA, Khalti, or banking app</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 text-center">
              <strong>Payment Method:</strong> Bank Transfer, ESEWA, Khalti<br />
              <strong>Processing Time:</strong> Within 24 hours
            </p>
          </div>
        </div>

        {/* Payment Proof Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Submit Payment Proof</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your transaction ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
            </div>

            {paymentProof && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected file:</strong> {paymentProof.name}
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
