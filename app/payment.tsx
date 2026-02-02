"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [postDetails, setPostDetails] = useState<{
    work: string;
    place: string;
    salary: string;
    time: string;
    post_type: string;
    photo_url?: string;
  } | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  // Get query parameters
  const type = searchParams.get('type');
  const paymentRequestId = searchParams.get('id');

  const fetchPaymentData = useCallback(async () => {
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
  }, [paymentRequestId, type]);

  useEffect(() => {
    if (!type || !paymentRequestId) {
      setError("Invalid payment request URL");
      setLoading(false);
      return;
    }

    fetchPaymentData();
  }, [type, paymentRequestId, fetchPaymentData]);

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
        // Show success toast before redirect
        const message = isPostPromotion 
          ? "Payment submitted! Your post will be published within 24 hours."
          : "Payment submitted! You'll receive the contact number via email/SMS within 24 hours.";
        
        toast({
          title: "Payment Submitted Successfully!",
          description: message,
        });
        
        // Redirect to success page with payment details
        const successUrl = `/success?type=${type}&amount=${amount}&transactionId=${encodeURIComponent(transactionId.trim())}`;
        setTimeout(() => {
          router.push(successUrl);
        }, 1000);
      } else {
        setError(result.error || 'Failed to submit payment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit payment';
      setError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
        <div className="max-w-2xl w-full mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} className="w-full">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPostPromotion = type === 'post_promotion';
  const amount = 299; // Fixed amount

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Post Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💳 Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900 mb-2">Rs. {amount}</p>
                <p className="text-sm text-blue-700">Fixed payment amount</p>
              </div>
            </div>

            <Separator />

            {/* QR Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scan QR code to complete payment</p>
              <img 
                src="/sanima-qr.png" 
                alt="Payment QR Code" 
                className="w-32 h-32 mx-auto border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-2">Scan with ESEWA, Khalti, or banking app</p>
            </div>

            <Separator />

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 text-center">
                <strong>Payment Method:</strong> Bank Transfer, ESEWA, Khalti<br />
                <strong>Processing Time:</strong> Within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Proof Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📸 Submit Payment Proof
            </CardTitle>
            <CardDescription>
              Upload your payment screenshot and enter transaction ID to complete verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>

              {paymentProof && (
                <Alert>
                  <AlertDescription>
                    <strong>Selected file:</strong> {paymentProof.name}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit Payment Proof'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
