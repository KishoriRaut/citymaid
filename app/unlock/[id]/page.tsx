"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUnlockRequestById } from "@/lib/unlock-requests";

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
}

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<UnlockRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadUnlockRequest(params.id as string);
    }
  }, [params.id]);

  const loadUnlockRequest = async (id: string) => {
    setLoading(true);
    try {
      const { request: data, error } = await getUnlockRequestById(id);
      
      if (error) {
        setError(error);
      } else if (data) {
        setRequest(data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading unlock request...</h2>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "This unlock request doesn't exist or has been removed."}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Unlock Request</h1>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Request ID</p>
                      <p className="text-sm text-gray-900">{request.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Post Title</p>
                      <p className="text-sm text-gray-900">{request.posts?.title || 'Unknown Post'}</p>
                    </div>
                    {request.posts?.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-sm text-gray-900">{request.posts.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted</p>
                      <p className="text-sm text-gray-900">
                        {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {request.posts?.contact && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact</p>
                        <p className="text-sm text-gray-900">{request.posts.contact}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {request.payment_proof && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h3>
                  <a
                    href={request.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Payment Proof
                  </a>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(request.updated_at).toLocaleDateString()} at {new Date(request.updated_at).toLocaleTimeString()}
                  </div>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
