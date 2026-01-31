"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactInfoDisplay } from "@/components/admin/ContactInfoDisplay";

interface ContactUnlockRequest {
  id: string;
  post_id: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  contact_preference?: string;
  status: 'pending' | 'paid' | 'approved' | 'rejected';
  payment_proof?: string;
  delivery_status?: 'pending' | 'sent' | 'failed' | 'manual';
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
  posts?: {
    work: string;
    place: string;
    salary: string;
    contact?: string;
  };
}

export default function ContactManagementPage() {
  const [contactRequests, setContactRequests] = useState<ContactUnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadContactRequests();
  }, [filter]);

  const loadContactRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contact-unlock-requests?status=${filter}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load contact requests');
      }

      setContactRequests(data.requests || []);
      
      // Debug: Log the first request to see what data we're getting
      if (data.requests && data.requests.length > 0) {
        console.log('🔍 Debug - First contact request:', data.requests[0]);
        console.log('🔍 Debug - Payment proof:', data.requests[0].payment_proof);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/contact-unlock-requests/${requestId}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          delivery_status: status,
          delivery_notes: notes 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update delivery status');
      }

      await loadContactRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'manual': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4 text-gray-600">Loading contact requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadContactRequests} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Contact Management</h1>
        <p className="text-gray-600">Manage contact unlock requests and delivery status</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({contactRequests.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          onClick={() => setFilter('paid')}
          size="sm"
        >
          Paid
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
          size="sm"
        >
          Approved
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
          size="sm"
        >
          Rejected
        </Button>
      </div>

      {/* Contact Requests Grid */}
      {contactRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No contact requests found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No contact unlock requests have been created yet.' 
              : `No contact requests with status "${filter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contactRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.posts?.work || 'Unknown Post'}</CardTitle>
                    <p className="text-sm text-gray-600">{request.posts?.place || 'Unknown Location'}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    {request.delivery_status && (
                      <Badge className={getDeliveryStatusColor(request.delivery_status)}>
                        {request.delivery_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Workflow Status */}
                <div className={`rounded-lg p-3 text-center ${
                  request.payment_proof 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    {request.payment_proof ? (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                          ✅ Payment Verified - Ready to Deliver Contact
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-yellow-800">
                          ⏳ Awaiting Payment Verification
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-2">👤 Contact Information</h4>
                  {request.user_name && (
                    <p className="text-sm text-gray-700">
                      <strong>Name:</strong> {request.user_name}
                    </p>
                  )}
                  {request.user_phone && (
                    <p className="text-sm text-gray-700">
                      <strong>Phone:</strong> {request.user_phone}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(request.user_phone!)}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        📋
                      </Button>
                    </p>
                  )}
                  {request.user_email && (
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong> {request.user_email}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(request.user_email!)}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        📋
                      </Button>
                    </p>
                  )}
                  {request.contact_preference && (
                    <p className="text-sm text-gray-700">
                      <strong>Preference:</strong> {request.contact_preference}
                    </p>
                  )}
                </div>

                {/* Payment Receipt - PROMINENT DISPLAY */}
                {request.payment_proof ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      📄 Payment Receipt 
                      <Badge className="bg-green-600 text-white">✅ Uploaded</Badge>
                    </h4>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                          const receiptUrl = request.payment_proof?.startsWith('http') 
                            ? request.payment_proof 
                            : `${supabaseUrl}/storage/v1/object/public/${request.payment_proof}`;
                          window.open(receiptUrl, '_blank');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        🖼️ View Receipt to Verify Payment
                      </Button>
                      <p className="text-xs text-green-700 text-center">
                        Click to view payment proof before delivering contact
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      📄 Payment Receipt 
                      <Badge className="bg-red-600 text-white">❌ Missing</Badge>
                    </h4>
                    <p className="text-sm text-red-700">
                      No payment receipt uploaded. User needs to submit payment proof.
                    </p>
                  </div>
                )}

                {/* Post Contact (for admin to deliver) */}
                {request.posts?.contact && (
                  <div className={`rounded-lg p-3 ${
                    request.payment_proof 
                      ? 'bg-purple-50 border-2 border-purple-200' 
                      : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                  }`}>
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                      📞 Post Contact (To Deliver)
                      {request.payment_proof ? (
                        <Badge className="bg-purple-600 text-white">Ready to Deliver</Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white">Awaiting Payment</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-700">
                      <strong>Contact:</strong> {request.posts.contact}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(request.posts!.contact!)}
                        className="ml-2 h-6 w-6 p-0"
                        disabled={!request.payment_proof}
                      >
                        📋
                      </Button>
                    </p>
                    {!request.payment_proof && (
                      <p className="text-xs text-gray-500 mt-2">
                        ⚠️ Verify payment receipt before delivering contact
                      </p>
                    )}
                  </div>
                )}

                {/* Delivery Status Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">🚚 Delivery Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={request.delivery_status === 'pending' ? 'default' : 'outline'}
                      onClick={() => updateDeliveryStatus(request.id, 'pending')}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={request.delivery_status === 'sent' ? 'default' : 'outline'}
                      onClick={() => updateDeliveryStatus(request.id, 'sent')}
                    >
                      Sent
                    </Button>
                    <Button
                      size="sm"
                      variant={request.delivery_status === 'failed' ? 'default' : 'outline'}
                      onClick={() => updateDeliveryStatus(request.id, 'failed')}
                    >
                      Failed
                    </Button>
                    <Button
                      size="sm"
                      variant={request.delivery_status === 'manual' ? 'default' : 'outline'}
                      onClick={() => updateDeliveryStatus(request.id, 'manual')}
                    >
                      Manual
                    </Button>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                  <p><strong>Updated:</strong> {new Date(request.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
