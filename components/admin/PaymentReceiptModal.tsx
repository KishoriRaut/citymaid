"use client";

import React, { useState } from "react";

import { getPaymentInfo, getSupabaseUrl } from "@/lib/payment-utils";
import type { Post } from "@/lib/types";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    work: string;
  };
  onApprovePayment: () => void;
  onRejectPayment: (reason: string) => void;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  post,
  onApprovePayment,
  onRejectPayment,
}: PaymentReceiptModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [fileExists, setFileExists] = useState<boolean | null>(null);

  if (!isOpen) return null;

  // Get payment info from the post
  const paymentInfo = getPaymentInfo(post as Post & { 
    payments?: { id: string; status: string; receipt_url?: string; created_at: string }[]; 
    contact_unlock_requests?: { id: string; status: string; payment_proof?: string; created_at: string }[]; 
    homepage_payment_status?: string; 
    payment_proof?: string | null;
  });
  const receiptUrl = paymentInfo.receiptUrl;

  // Normalize receipt URL to handle both full URLs and storage paths
  const finalReceiptUrl = receiptUrl ? getSupabaseUrl(receiptUrl) : null;

  // Validate if the file exists in storage
  const validateFileExists = async () => {
    if (!finalReceiptUrl) {
      setFileExists(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(finalReceiptUrl, { method: 'HEAD' });
      const exists = response.ok;
      setFileExists(exists);
    } catch (error) {
      console.error('Error checking file existence:', error);
      setFileExists(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Check file existence when modal opens or URL changes
  React.useEffect(() => {
    if (isOpen && finalReceiptUrl) {
      validateFileExists();
    } else if (!finalReceiptUrl) {
      setFileExists(false);
    }
  }, [isOpen, finalReceiptUrl]);

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      await onRejectPayment(rejectionReason);
      onClose();
      setShowRejectionForm(false);
      setRejectionReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePayment = async () => {
    setIsProcessing(true);
    try {
      await onApprovePayment();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">Payment Receipt Review</h2>
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

          {/* Payment Status */}
          <div className="mb-4">
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${
                paymentInfo.status === "approved"
                  ? "bg-purple-100 text-purple-800"
                  : paymentInfo.status === "pending" || paymentInfo.status === "paid"
                    ? "bg-orange-100 text-orange-800"
                    : paymentInfo.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {paymentInfo.status === "none" ? "No Payment" : 
               paymentInfo.status === "pending" ? "Payment Pending" :
               paymentInfo.status === "paid" ? "Payment Paid" :
               paymentInfo.status === "approved" ? "Payment Approved" :
               paymentInfo.status === "rejected" ? "Payment Rejected" : paymentInfo.status}
            </span>
          </div>

          {/* Receipt Image */}
          {isValidating ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">Checking receipt file...</p>
            </div>
          ) : fileExists === false ? (
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-center">
              <p className="text-red-600 font-medium">❌ Receipt file not found</p>
              <p className="text-red-500 text-sm mt-1">The receipt file referenced in the database does not exist in storage.</p>
              <p className="text-red-400 text-xs mt-2">URL: {finalReceiptUrl}</p>
            </div>
          ) : finalReceiptUrl ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Payment Receipt</h3>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={finalReceiptUrl}
                  alt="Payment Receipt"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder-image";
                    e.currentTarget.alt = "Receipt file not found in storage";
                  }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => window.open(finalReceiptUrl, "_blank")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Open in new tab
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalReceiptUrl);
                    alert("Receipt URL copied to clipboard");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No payment receipt uploaded</p>
            </div>
          )}

          {/* Actions */}
          {!showRejectionForm ? (
            <div className="flex gap-3">
              {(paymentInfo.status === "pending" || paymentInfo.status === "paid") && finalReceiptUrl && fileExists === true && (
                <>
                  <button
                    onClick={handleApprovePayment}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "✓ Approve Payment"}
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    ✗ Reject Payment
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this payment is being rejected..."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRejectPayment}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionReason("");
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
