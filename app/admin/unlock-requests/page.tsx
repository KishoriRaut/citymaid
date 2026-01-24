"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
import { getAllUnlockRequests, approveUnlockRequest, rejectUnlockRequest, type ContactUnlockRequest } from "@/lib/unlock-requests";

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
  };
}

export default function UnlockRequestsPage() {
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('paid');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { requests: data, error } = await getAllUnlockRequests(
        filter === 'all' ? undefined : filter
      );
      
      if (error) {
        console.error("Error loading requests:", error);
      } else {
        setRequests(data || []);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { success, error } = await approveUnlockRequest(requestId);
      
      if (success) {
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'approved' as const }
              : req
          )
        );
      } else {
        alert(`Failed to approve: ${error}`);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Reason for rejection (optional):");
    setProcessing(requestId);
    try {
      const { success, error } = await rejectUnlockRequest(requestId, reason || undefined);
      
      if (success) {
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejected' as const }
              : req
          )
        );
      } else {
        alert(`Failed to reject: ${error}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading unlock requests...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Unlock Requests</h1>
            <p className="text-gray-600">Review and approve payment proof submissions</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'paid'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paid (Awaiting Review)
              </button>
            </nav>
          </div>

          {/* Requests List */}
          <div className="bg-white shadow rounded-lg">
            {requests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No {filter === 'all' ? '' : filter} unlock requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Proof
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.posts?.title || 'Unknown Post'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.id.slice(0, 8)}...
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Visitor ID: {request.visitor_id || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.payment_proof ? (
                            <a
                              href={request.payment_proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              View Proof
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No proof</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'paid' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                disabled={processing === request.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {processing === request.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                disabled={processing === request.id}
                                variant="outline"
                                size="sm"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-green-600">Approved</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-red-600">Rejected</span>
                          )}
                          {request.status === 'pending' && (
                            <span className="text-gray-400">Awaiting Payment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
