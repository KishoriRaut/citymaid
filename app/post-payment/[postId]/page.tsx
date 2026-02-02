"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateHomepagePaymentProof } from "@/lib/homepage-payments";
import { uploadPaymentReceipt } from "@/lib/storage";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

// Check if Supabase is configured
const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface Post {
  id: string;
  title: string;
  work: string;
  place: string;
  salary: string;
  post_type: string;
  status: string;
  homepage_payment_status: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function PostPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = params.postId as string;
  const isContactUnlock = searchParams.get("type") === "contact_unlock";
  const unlockRequestId = searchParams.get("requestId");

  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            Supabase is not configured. Please set up your environment variables:
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL</strong></p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong></p>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Copy these from your Supabase project settings and add them to your .env.local file.
          </p>
        </div>
      </div>
    );
  }

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // New contact information fields
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [contactPreference, setContactPreference] = useState<"sms" | "email" | "both">("both");

  useEffect(() => {
    if (params.postId) {
      loadPost(params.postId as string);
    }
  }, [params.postId]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    try {
      // For now, we'll need to fetch post details
      // In a real implementation, you'd have a getPostById function
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
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload an image (JPG, PNG) or PDF file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      setPaymentProof(file);
      setError(null);
    }
  };

  const handleSubmitPaymentProof = async () => {
    // Validate contact information for contact unlock
    if (isContactUnlock) {
      if (!userName.trim()) {
        setError("Please provide your full name");
        return;
      }
      if (!userPhone.trim()) {
        setError("Please provide your phone number");
        return;
      }
      if (!userEmail.trim()) {
        setError("Please provide your email address");
        return;
      }
      if (userName.length < 2 || userName.length > 100) {
        setError("Please provide a valid name (2-100 characters)");
        return;
      }
      if (userPhone.length !== 10 || !/^\d+$/.test(userPhone)) {
        setError("Please provide a valid 10-digit phone number");
        return;
      }
      if (!userEmail.includes('@') || !userEmail.includes('.')) {
        setError("Please provide a valid email address");
        return;
      }
    }

    // Payment proof is mandatory for both post and contact unlock payments
    if (!paymentProof) {
      setError("Payment proof is required. Please upload a screenshot or receipt.");
      return;
    }

    if (!post) return;

    setIsSubmitting(true);
    try {
      const visitorId = getOrCreateVisitorId();
      
      if (isContactUnlock && unlockRequestId) {
        // Handle contact unlock payment using server-side function
        const base64String = paymentProof ? await fileToBase64(paymentProof) : '';
        
        const formData = new FormData();
        formData.append('requestId', unlockRequestId);
        formData.append('type', 'contact_unlock');
        formData.append('paymentProofBase64', base64String);
        formData.append('fileName', paymentProof?.name || '');
        formData.append('fileType', paymentProof?.type || '');
        formData.append('transactionId', transactionId.trim());
        
        // Add contact information
        formData.append('userName', userName.trim());
        formData.append('userPhone', userPhone.trim());
        formData.append('userEmail', userEmail.trim());
        formData.append('contactPreference', contactPreference);

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
          setShowConfirmation(true);
        } else {
          setError(result.error || 'Failed to submit payment');
        }
      } else {
        // Handle post promotion payment with actual file upload
        let receiptUrl = null;
        
        if (paymentProof) {
          // Upload file to Supabase Storage first
          const uploadResult = await uploadPaymentReceipt(paymentProof);
          
          if (uploadResult.error || !uploadResult.url) {
            throw new Error(`Failed to upload receipt: ${uploadResult.error}`);
          }
          
          receiptUrl = uploadResult.url;
          console.log("✅ Receipt uploaded to storage:", receiptUrl);
        } else if (transactionId.trim()) {
          // For transaction ID only, create a placeholder
          receiptUrl = `transaction_${post.id}_${transactionId.trim()}_${Date.now()}`;
          console.log("📝 Using transaction ID placeholder:", receiptUrl);
        } else {
          throw new Error("Either payment proof file or transaction ID is required");
        }

        console.log("Submitting payment proof:", {
          postId: post.id,
          receiptUrl,
          visitorId,
          hasFile: !!paymentProof,
          transactionId
        });

        const { success, error } = await updateHomepagePaymentProof(
          post.id,
          receiptUrl
        );

        console.log("Payment proof submission result:", { success, error });

        if (success) {
          setShowConfirmation(true);
        } else {
          setError(`Failed to submit payment proof: ${error}`);
        }
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      setError(`Failed to submit payment proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading post details...</h2>
        </div>
      </div>
    );
  }

  if (error && !showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm mb-2">
                <strong>✅ Your payment is submitted and verification is in progress.</strong>
              </p>
              <p className="text-green-800 text-sm mb-2">
                <strong>⏰ You will receive confirmation within 24 hours.</strong>
              </p>
              {isContactUnlock ? (
                <p className="text-green-800 text-sm">
                  <strong>📞 You will receive the contact number via email/SMS within 24 hours.</strong>
                </p>
              ) : (
                <p className="text-green-800 text-sm">
                  <strong>🏠 Your post will be published on homepage within 24 hours.</strong>
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Back to Listings
              </Button>
              <Button 
                onClick={() => router.push(`/post/${post?.id}`)} 
                variant="outline"
                className="w-full"
              >
                View My Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't allow if already pending or approved
  if (post?.homepage_payment_status === 'pending' || post?.homepage_payment_status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {post?.homepage_payment_status === 'pending' ? 'Payment Pending' : 'Already Approved'}
          </h2>
          <p className="text-gray-600 mb-4">
            {post?.homepage_payment_status === 'pending' 
              ? 'Your homepage feature payment is currently under review.'
              : 'This post is already approved for homepage display.'
            }
          </p>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isContactUnlock ? 'Unlock Contact Information' : 'Feature Your Post on Homepage'}
              </h1>
              <p className="text-gray-600">
                {isContactUnlock ? 'Get contact details for this job opportunity' : 'Get maximum visibility for your post'}
              </p>
            </div>

            {/* Marketing Banner - Contact Unlock Promotion */}
            {isContactUnlock && (
              <div className="mx-6 mb-6">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-xl overflow-hidden rounded-lg">
                  <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-black/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative px-6 py-4 text-white">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className="text-xl">🔓</span>
                            </div>
                            <h3 className="text-lg font-bold">Unlock Contact Numbers</h3>
                          </div>
                          <p className="text-white/90 text-sm">
                            Get instant access to contact details for just <span className="font-bold text-yellow-300">NRs. 300</span>
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                              ✓ Verified Contacts
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                              ✓ Instant Access
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                              ✓ Secure Payment
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-2xl font-bold text-yellow-300">
                            NRs. 300
                          </div>
                          <div className="text-xs text-white/80 text-center">
                            One-time<br />unlock fee
                          </div>
                          <div className="text-xs text-white/60 italic text-center mt-1">
                            Complete payment below to unlock
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{post?.title || `${post?.work} - ${post?.place}`}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Work:</span> {post?.work}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {post?.place}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {post?.salary}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {post?.post_type === 'employer' ? 'Hiring' : 'Job Seeker'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>{isContactUnlock ? 'Contact Unlock Fee:' : 'Homepage Feature Fee:'}</strong> 
                    {isContactUnlock ? ' Get contact details for this job opportunity.' : ' Get your post displayed prominently on the homepage for 30 days.'}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Price:</strong> Rs. 299
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
                    
                    {/* eSewa Section */}
                    <div className="bg-white border-2 border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-sm">e</span>
                        </div>
                        <h5 className="font-medium text-gray-900">eSewa Payment</h5>
                      </div>
                      <div className="bg-green-50 rounded p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">eSewa Details:</p>
                        <div className="space-y-1 text-xs text-gray-700">
                          <p><strong>eSewa ID:</strong> +9779841317273</p>
                          <p><strong>Company Name:</strong> City Maid Services Pvt. Ltd.</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-600">Open eSewa app → Send Money → Enter details → Pay Rs. 299</p>
                        </div>
                      </div>
                    </div>

                    {/* Sanima Bank QR Section */}
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <h5 className="font-medium text-gray-900">Sanima Bank QR</h5>
                      </div>
                      <div className="w-40 h-40 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src="/sanima-qr.png" 
                          alt="Sanima Bank QR Code" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-gray-500 text-sm">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <p>QR Code</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 text-center">Scan with Sanima Bank app</p>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Instructions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        {/* eSewa Instructions */}
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <h5 className="font-medium text-green-800 mb-2 text-sm">For eSewa Users:</h5>
                          <ol className="text-xs text-green-700 space-y-1">
                            <li>1. Open eSewa app</li>
                            <li>2. Tap "Send Money"</li>
                            <li>3. Enter eSewa ID: +9779841317273</li>
                            <li>4. Enter amount: Rs. 299</li>
                            <li>5. Complete payment</li>
                            <li>6. Save transaction screenshot</li>
                          </ol>
                        </div>

                        {/* Sanima Bank Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <h5 className="font-medium text-blue-800 mb-2 text-sm">For Sanima Bank Users:</h5>
                          <ol className="text-xs text-blue-700 space-y-1">
                            <li>1. Scan QR code with Sanima Bank app</li>
                            <li>2. Enter amount: Rs. 299</li>
                            <li>3. Complete the payment</li>
                            <li>4. Save the transaction ID or screenshot</li>
                          </ol>
                        </div>

                        {/* Bank Transfer Instructions */}
                        <div className="bg-purple-50 border border-purple-200 rounded p-3">
                          <h5 className="font-medium text-purple-800 mb-2 text-sm">For Bank Transfer:</h5>
                          <div className="text-xs text-purple-700 space-y-1">
                            <p><strong>Account Number:</strong> 005010010001200</p>
                            <p><strong>Account Name:</strong> City Maid Services Pvt. Ltd.</p>
                            <p><strong>Branch Name:</strong> Kumaripati</p>
                            <p><strong>Bank Code:</strong> SNMANPKA</p>
                            <p className="mt-2 font-medium">Transfer Rs. 299 and save receipt</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section - Only for Contact Unlock */}
              {isContactUnlock && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contact Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Provide your contact details below. After payment approval, we'll send the job contact information to you.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="user-name"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., John Doe"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your full name for personalized communication
                      </p>
                    </div>

                    <div>
                      <label htmlFor="user-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        id="user-phone"
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9849317227"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: 10-digit mobile number
                      </p>
                    </div>

                    <div>
                      <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="user-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., your.email@example.com"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send contact details to this email
                      </p>
                    </div>

                    <div>
                      <label htmlFor="contact-preference" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Preference *
                      </label>
                      <select
                        id="contact-preference"
                        value={contactPreference}
                        onChange={(e) => setContactPreference(e.target.value as "sms" | "email" | "both")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="sms">SMS Only</option>
                        <option value="email">Email Only</option>
                        <option value="both">Both SMS and Email</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How would you like to receive the job contact information?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Payment Proof</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="payment-proof" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Payment Proof * (Screenshot or Receipt - Required)
                    </label>
                    <input
                      id="payment-proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-2">
                      OR Enter Transaction ID
                    </label>
                    <input
                      id="transaction-id"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleSubmitPaymentProof}
                  disabled={isSubmitting || !paymentProof}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
