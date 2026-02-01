"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatTimeWithDetails, isFreshPost } from "@/lib/time-ago";

interface Post {
  id: string;
  title?: string;
  work: string;
  place: string;
  salary: string;
  post_type: "employer" | "employee";
  contact: string;
  details: string;
  photo_url?: string;
  status: string;
  homepage_payment_status: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function PostViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPost(params.id as string);
    }
  }, [params.id]);

  const loadPost = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.post) {
        setPost(data.post);
      } else {
        setError("Post not found");
      }
    } catch (error) {
      console.error("Error loading post:", error);
      setError("Failed to load post");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading post...</h2>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The post you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const postTitle = post.title || `${post.work} - ${post.place}`;
  const isEmployer = post.post_type === "employer";
  
  // Format posting time - add null check
  const timeInfo = post.created_at ? formatTimeWithDetails(post.created_at) : { relative: 'Unknown time', title: 'No creation date' };
  const isFresh = post.created_at ? isFreshPost(post.created_at) : false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="mb-4"
            >
              ← Back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{postTitle}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isEmployer 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isEmployer ? '🏢 Hiring' : '👤 Job Seeker'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : post.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status === 'approved' ? '✅ Approved' : 
                     post.status === 'pending' ? '⏳ Pending Review' : 
                     post.status}
                  </span>
                  {post.homepage_payment_status === 'approved' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      ⭐ Featured on Homepage
                    </span>
                  )}
                </div>
              </div>
              {/* Posting Time */}
              <div className="text-right">
                <div 
                  className="text-sm text-gray-600 font-medium"
                  title={timeInfo.title}
                >
                  🕐 {timeInfo.relative}
                </div>
                {isFresh && (
                  <div className="text-xs text-green-600 font-medium">
                    🔥 Fresh Post
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Photo Section (only for employee posts) */}
            {!isEmployer && post.photo_url && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={post.photo_url}
                  alt={postTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="text-center text-gray-500">
                          <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p>Photo not available</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            )}

            {/* Post Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Work Type</h3>
                    <p className="text-lg font-semibold text-gray-900">{post.work}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p className="text-lg font-semibold text-gray-900">{post.place}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Salary</h3>
                    <p className="text-lg font-semibold text-gray-900">{post.salary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      {isEmployer ? 'Job Details' : 'About Me'}
                    </h3>
                    <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {post.details || 'No details available'}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Posted Date</h3>
                    <p className="text-lg text-gray-900">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {post.homepage_payment_status !== 'none' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Homepage Status</h3>
                      <p className="text-lg">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.homepage_payment_status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : post.homepage_payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {post.homepage_payment_status === 'approved' ? '✅ Featured' : 
                           post.homepage_payment_status === 'pending' ? '⏳ Payment Pending' : 
                           post.homepage_payment_status === 'rejected' ? '❌ Payment Rejected' : 
                           post.homepage_payment_status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">📞 Contact Information</h3>
                  
                  {/* Check if contact should be visible */}
                  {post.homepage_payment_status === 'approved' ? (
                    <>
                      <p className="text-lg font-semibold text-blue-800">{post.contact}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {isEmployer 
                          ? "Contact this employer for the job opportunity"
                          : "Contact this job seeker for the position"
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-blue-800">
                        {post.contact ? post.contact.substring(0, 2) + '******' + post.contact.substring(post.contact.length - 2) : 'Contact hidden'}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {isEmployer 
                          ? "🔒 Contact available after payment verification"
                          : "🔒 Contact available after payment verification"
                        }
                      </p>
                      <div className="mt-3">
                        <Button 
                          onClick={() => router.push(`/post-payment/${post.id}`)}
                          className="w-full"
                          size="sm"
                        >
                          💳 Unlock Contact Information
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={() => router.push("/")} 
                  variant="outline"
                  className="flex-1"
                >
                  Browse More Posts
                </Button>
                {post.homepage_payment_status === 'none' && (
                  <Button 
                    onClick={() => router.push(`/post-payment/${post.id}`)} 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Feature on Homepage
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Listing</h3>
            <div className="prose prose-sm text-gray-600">
              <p>
                {isEmployer 
                  ? "This employer is looking for qualified candidates for the position mentioned above. Contact them directly using the provided information."
                  : "This job seeker is available for the work type mentioned above. Contact them directly using the provided information."
                }
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">💡 Tips:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Be professional when contacting</li>
                  <li>• Have your relevant documents ready</li>
                  <li>• Discuss salary expectations clearly</li>
                  <li>• Ask about work schedule and requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
