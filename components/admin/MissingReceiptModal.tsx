"use client";

import { useState, useEffect } from "react";
import { getPaymentInfo } from "@/lib/payment-utils";
import { ContactInfoDisplay } from "@/components/admin/ContactInfoDisplay";
import { Button } from "@/components/ui/button";

interface MissingReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    work: string;
    contact?: string;
    contact_unlock_requests?: {
      id: string;
      status: string;
      payment_proof?: string;
      created_at: string;
      user_name?: string;
      user_phone?: string;
      user_email?: string;
      contact_preference?: string;
      delivery_status?: string;
      delivery_notes?: string;
    }[];
  };
}

export function MissingReceiptModal({
  isOpen,
  onClose,
  post,
}: MissingReceiptModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch payment info when modal opens
  useEffect(() => {
    if (isOpen && post.id) {
      fetchPaymentInfo();
    }
  }, [isOpen, post.id]);

  const fetchPaymentInfo = async () => {
    setLoading(true);
    try {
      // Try to fetch post with payment data
      const response = await fetch(`/api/posts/${post.id}`);
      
      if (!response.ok) {
        console.error('Failed to fetch post:', response.status);
        setPaymentInfo({ status: 'unknown', type: 'unknown', receiptUrl: null });
        return;
      }
      
      const postData = await response.json();
      
      if (postData.success && postData.post) {
        const info = getPaymentInfo(postData.post);
        setPaymentInfo(info);
        console.log('Payment info fetched:', info);
      } else {
        console.error('Invalid post data:', postData);
        setPaymentInfo({ status: 'unknown', type: 'unknown', receiptUrl: null });
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      setPaymentInfo({ status: 'unknown', type: 'unknown', receiptUrl: null });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const paymentLink = `/post-payment/${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${paymentLink}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-orange-600">Receipt Missing</h2>
              <p className="text-sm text-gray-600 mt-1">
                Post: <span className="font-medium">{post.work}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading payment information...</p>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm">
                    <strong>⚠️ Payment Status:</strong> {paymentInfo?.status || 'Unknown'}
                  </p>
                  <p className="text-orange-700 text-sm mt-2">
                    This payment has a {paymentInfo?.status || 'pending'} status but no receipt file is available.
                  </p>
                  {paymentInfo?.type && (
                    <p className="text-orange-600 text-xs mt-1">
                      Type: {paymentInfo.type === 'homepage' ? 'Post Promotion' : paymentInfo.type === 'contact_unlock' ? 'Contact Unlock' : 'Unknown'}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What to do:</h3>
              <ol className="text-sm text-gray-700 space-y-2">
                <li>1. Contact the user to upload a payment receipt</li>
                <li>2. Share the payment link below with the user</li>
                <li>3. Wait for the user to submit payment proof</li>
                <li>4. Review and approve the payment once received</li>
              </ol>
            </div>

            {/* Payment Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Payment Link for User:</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded break-all">
                  {window.location.origin}{paymentLink}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                >
                  {copiedLink ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Contact Info */}
            {post.contact && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Contact Information:</h3>
                <p className="text-sm text-gray-700">
                  <strong>Phone:</strong> {post.contact}
                </p>
              </div>
            )}

            {/* Payment Receipt Display */}
            {paymentInfo?.receiptUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-3">📄 Payment Receipt</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => window.open(paymentInfo.receiptUrl, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      🖼️ View Receipt
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.receiptUrl);
                        alert('Receipt URL copied to clipboard!');
                      }}
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      📋 Copy URL
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information for Contact Unlock */}
            {paymentInfo?.type === 'contact_unlock' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">👤 Contact Information</h3>
                <ContactInfoDisplay postId={post.id} />
              </div>
            )}

            {/* Debug: Show contact unlock requests even if paymentInfo type is unknown */}
            {paymentInfo?.type === 'unknown' && post.contact_unlock_requests && post.contact_unlock_requests.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">🔍 Debug: Contact Requests Found</h3>
                <p className="text-sm text-yellow-800">
                  Found {post.contact_unlock_requests.length} contact unlock requests but paymentInfo.type is 'unknown'
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <h3 className="font-medium text-blue-900 mb-3">👤 Contact Information</h3>
                  <ContactInfoDisplay postId={post.id} />
                </div>
              </div>
            )}

            {/* Storage Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">📁 Storage Information:</h3>
              <p className="text-xs text-purple-700">
                All payment receipts should be stored in the <strong>payment-receipts</strong> bucket in Supabase Storage.
              </p>
              <p className="text-xs text-purple-600 mt-1">
                New uploads will automatically save to the correct bucket with proper file validation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
