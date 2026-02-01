"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Home, ArrowLeft, Clock, DollarSign, User } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    type: string;
    amount: number;
    transactionId?: string;
    postDetails?: {
      work: string;
      place: string;
      salary: string;
      time: string;
      post_type: string;
    };
  } | null>(null);

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const type = searchParams.get('type') || 'payment';
    const amount = Number(searchParams.get('amount')) || 299;
    const transactionId = searchParams.get('transactionId');
    
    setPaymentData({
      type,
      amount,
      transactionId: transactionId || undefined,
    });
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we prepare your success page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isPostPromotion = paymentData?.type === 'post_promotion';
  const isContactUnlock = paymentData?.type === 'contact_unlock';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your payment. Admin will verify your payment shortly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Confirmation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Confirmation
              </CardTitle>
              <CardDescription>
                Your payment has been received and is being processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Amount Paid</span>
                <span className="font-bold text-green-900">Rs. {paymentData?.amount}</span>
              </div>
              
              {paymentData?.transactionId && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900">{paymentData.transactionId}</span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Payment Type</span>
                <Badge variant="secondary">
                  {isPostPromotion ? 'Post Promotion' : isContactUnlock ? 'Contact Unlock' : 'Payment'}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Processing time: Within 24 hours</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                What Happens Next?
              </CardTitle>
              <CardDescription>
                Here's what to expect after your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Admin Verification</p>
                    <p className="text-sm text-gray-600">Our team will review your payment proof</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Approval</p>
                    <p className="text-sm text-gray-600">You'll receive a confirmation notification</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {isPostPromotion ? 'Post Published' : 'Contact Unlocked'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isPostPromotion 
                        ? 'Your post will appear on the homepage'
                        : 'You can view the contact information'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>💡 Tip:</strong> Keep your payment receipt handy for future reference.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
                size="lg"
              >
                <Home className="w-4 h-4" />
                Browse More Posts
              </Button>
              
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your payment, feel free to contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-blue-600">support@citymaid.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span className="text-blue-600">+977-98XXXXXXXX</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
