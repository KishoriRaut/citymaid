"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Phone, Mail, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";

interface ContactUnlockRequest {
  id: string;
  post_id: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  contact_preference?: string;
  status: string;
  delivery_status: string;
  delivery_notes?: string;
  payment_proof?: string;
  created_at: string;
  posts: {
    work: string;
    place: string;
    salary: string;
    post_type: string;
  };
}

interface ContactInfoDisplayProps {
  postId: string;
}

export function ContactInfoDisplay({ postId }: ContactInfoDisplayProps) {
  const [unlockRequests, setUnlockRequests] = useState<ContactUnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactUnlockRequests();
  }, [postId]);

  const fetchContactUnlockRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/contact-unlock-requests`);
      const data = await response.json();

      if (data.success) {
        setUnlockRequests(data.unlockRequests);
      } else {
        setError(data.error || 'Failed to fetch contact unlock requests');
      }
    } catch (error) {
      console.error('Error fetching contact unlock requests:', error);
      setError('Failed to fetch contact unlock requests');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const updateDeliveryStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/contact-unlock-requests/${requestId}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delivery_status: status }),
      });

      if (response.ok) {
        fetchContactUnlockRequests(); // Refresh the data
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'manual':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getContactPreferenceIcon = (preference?: string) => {
    switch (preference) {
      case 'sms':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-600" />;
      case 'both':
        return <div className="flex gap-1">
          <Phone className="w-3 h-3 text-blue-600" />
          <Mail className="w-3 h-3 text-green-600" />
        </div>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading contact information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (unlockRequests.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No contact unlock requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Contact Unlock Requests</h3>
      
      {unlockRequests.map((request) => (
        <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {/* Request Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium text-gray-900">
                {request.posts.work} - {request.posts.place}
              </p>
              <p className="text-sm text-gray-600">
                Requested: {new Date(request.created_at).toLocaleDateString()}
              </p>
              {request.user_name && (
                <p className="text-sm text-gray-700 font-medium">
                  From: {request.user_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getContactPreferenceIcon(request.contact_preference)}
              <span className="text-xs text-gray-500 capitalize">
                {request.contact_preference || 'not specified'}
              </span>
            </div>
          </div>

          {/* User Contact Information */}
          {(request.user_phone || request.user_email) && (
            <div className="mb-3 space-y-2">
              {request.user_phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{request.user_phone}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(request.user_phone!, 'phone')}
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {request.user_email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{request.user_email}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(request.user_email!, 'email')}
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Delivery Status */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {getDeliveryStatusIcon(request.delivery_status)}
              <span className="text-sm font-medium capitalize">
                Delivery: {request.delivery_status}
              </span>
            </div>
            
            {request.status === 'paid' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateDeliveryStatus(request.id, 'manual')}
                  className="h-6 px-2"
                >
                  Manual
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateDeliveryStatus(request.id, 'sent')}
                  className="h-6 px-2"
                >
                  Sent
                </Button>
              </div>
            )}
          </div>

          {/* Delivery Notes */}
          {request.delivery_notes && (
            <div className="mt-2 text-xs text-gray-600">
              <strong>Notes:</strong> {request.delivery_notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
