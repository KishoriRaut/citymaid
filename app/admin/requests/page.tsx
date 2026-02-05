"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, LoadMoreButton } from "@/components/ui/pagination";
import { Eye, CheckCircle, XCircle, FileText, Unlock, Phone, Mail, MessageSquare, Copy, Edit, Trash2, EyeOff } from "lucide-react";
import { getAllAdminPayments, updateAdminPaymentStatus, type AdminPayment } from "@/lib/admin-payments";
import { getAllUnlockRequests, approveUnlockRequest, rejectUnlockRequest, type ContactUnlockRequest } from "@/lib/unlock-requests";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

// Define the unified request interface
interface UnifiedRequest {
  id: string;
  type: "Post" | "Contact Unlock";
  reference: string;
  user: string;
  paymentProof: string | null;
  transactionId: string | null;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  originalData: AdminPayment | ContactUnlockRequest;
  // Contact unlock specific fields
  contactInfo?: {
    user_name?: string;
    user_phone?: string;
    user_email?: string;
    contact_preference?: string;
  };
  postContact?: string; // Contact to deliver
}

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "post" | "contact-unlock">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get initial page from URL or default to 1
  const initialPage = Number(searchParams.get('page')) || 1;

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load requests with pagination
  const loadRequests = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setIsPageChanging(true);
      }
      
      // Determine status filter for unlock requests
      const unlockStatus = filter === "all" ? undefined : 
        filter === "hidden" ? "rejected" : 
        filter === "approved" ? "approved" : 
        filter === "rejected" ? "rejected" : 
        filter === "pending" ? "pending" : undefined;
      
      // Use Promise.all to fetch data in parallel with pagination
      const [paymentData, unlockData] = await Promise.all([
        getAllAdminPayments(page, 20),
        getAllUnlockRequests(unlockStatus, page, 20)
      ]);
      
      // Process data only after both calls complete
      const unifiedRequests: UnifiedRequest[] = [];
      
      // Add post payments as "Post" type
      paymentData?.payments?.forEach((payment: AdminPayment) => {
        unifiedRequests.push({
          id: payment.id,
          type: "Post",
          reference: payment.posts?.work || "Unknown Post",
          user: payment.visitor_id || "",
          paymentProof: payment.receipt_url,
          transactionId: payment.reference_id,
          submittedAt: payment.created_at,
          status: payment.status as "pending" | "approved" | "rejected" | "hidden",
          originalData: payment,
          postContact: payment.posts?.contact
        });
      });
      
      // Add unlock requests as "Contact Unlock" type
      unlockData?.requests?.forEach((unlock: ContactUnlockRequest) => {
        unifiedRequests.push({
          id: unlock.id,
          type: "Contact Unlock",
          reference: unlock.posts?.work || "Unknown Post",
          user: unlock.visitor_id || "",
          paymentProof: unlock.payment_proof,
          transactionId: null,
          submittedAt: unlock.created_at,
          status: unlock.status as "pending" | "approved" | "rejected" | "hidden",
          originalData: unlock,
          contactInfo: {
            user_name: unlock.user_name || undefined,
            user_phone: unlock.user_phone || undefined,
            user_email: unlock.user_email || undefined,
            contact_preference: unlock.contact_preference || undefined,
          },
          postContact: unlock.posts?.contact
        });
      });
      
      // Sort by submitted date (newest first)
      unifiedRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setRequests(unifiedRequests);
      
      // Calculate combined pagination info
      const combinedTotal = (paymentData?.total || 0) + (unlockData?.total || 0);
      const combinedPages = Math.ceil(combinedTotal / 20);
      
      setCurrentPage(page);
      setTotalPages(combinedPages);
      setTotalRequests(combinedTotal);
      setHasNextPage(page < combinedPages);
      setHasPrevPage(page > 1);
      
      console.log(`✅ Loaded ${unifiedRequests.length} requests (Page ${page} of ${combinedPages})`);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
      setIsPageChanging(false);
    }
  }, [filter]);

  // Initialize page state from URL
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Initial load and page changes
  useEffect(() => {
    if (mounted) { // Only load after component is mounted
      loadRequests(initialPage, true);
    }
  }, [initialPage, loadRequests, mounted]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
    
    loadRequests(page, false);
  }, [loadRequests, searchParams, pathname, router]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Handle type filter changes
  const handleTypeFilterChange = useCallback((newTypeFilter: typeof typeFilter) => {
    setTypeFilter(newTypeFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Filter requests with useMemo to prevent unnecessary re-renders
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const statusMatch = filter === "all" || request.status === filter;
      const typeMatch = typeFilter === "all" || 
        (typeFilter === "post" && request.type === "Post") ||
        (typeFilter === "contact-unlock" && request.type === "Contact Unlock");
      
      return statusMatch && typeMatch;
    });
  }, [requests, filter, typeFilter]);

  // Get counts for tabs with useMemo for performance
  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    hidden: requests.filter(r => r.status === "hidden").length,
  }), [requests]);

  // Handle approve/reject
  const handleApprove = async (request: UnifiedRequest) => {
    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        const response = await fetch(`/api/debug-button-actions-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approve',
            postId: (request.originalData as AdminPayment).post_id
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to approve post');
        }
        
        const result = await response.json();
        if (!result.result?.success) {
          throw new Error(result.result?.message || 'Failed to approve post');
        }
      } else {
        const response = await fetch(`/api/debug-button-actions-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approve',
            requestId: request.id
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to approve unlock request');
        }
        
        const result = await response.json();
        if (!result.result?.success) {
          throw new Error(result.result?.message || 'Failed to approve unlock request');
        }
      }
      
      await loadRequests(currentPage, false);
      console.log(`✅ Successfully approved ${request.type}: ${request.id}`);
    } catch (error) {
      console.error(`❌ Error approving ${request.type.toLowerCase()}:`, error);
      alert(`Failed to approve ${request.type.toLowerCase()}. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  const handleHide = async (request: UnifiedRequest) => {
    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        const response = await fetch(`/api/debug-button-actions-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'hide',
            postId: (request.originalData as AdminPayment).post_id
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to hide post');
        }
        
        const result = await response.json();
        if (!result.result?.success) {
          throw new Error(result.result?.message || 'Failed to hide post');
        }
      } else {
        // For contact unlock requests, we could implement a similar hide functionality
        // For now, we'll reject them (you can extend this later)
        const { error } = await rejectUnlockRequest(request.id);
        if (error) {
          throw new Error('Failed to hide unlock request');
        }
      }
      
      await loadRequests(currentPage, false);
      console.log(`✅ Successfully hidden ${request.type}: ${request.id}`);
    } catch (error) {
      console.error(`❌ Error hiding ${request.type.toLowerCase()}:`, error);
      alert(`Failed to hide ${request.type.toLowerCase()}. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  const handleEdit = (request: UnifiedRequest) => {
    if (request.type === "Post") {
      // Get post ID from originalData
      const postData = request.originalData as AdminPayment;
      // Navigate to edit post page
      window.open(`/post/${postData.post_id}/edit`, '_blank');
    } else {
      // For contact unlock requests, you could implement an edit modal or navigate to an edit page
      console.log("Edit contact unlock request:", request.id);
    }
  };

  const handleShow = async (request: UnifiedRequest) => {
    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        const response = await fetch(`/api/debug-button-actions-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'show',
            postId: (request.originalData as AdminPayment).post_id
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to show post');
        }
        
        const result = await response.json();
        if (!result.result?.success) {
          throw new Error(result.result?.message || 'Failed to show post');
        }
      } else {
        // For contact unlock requests, we could implement a similar show functionality
        console.log("Show contact unlock request:", request.id);
      }
      
      await loadRequests(currentPage, false);
      console.log(`✅ Successfully shown ${request.type}: ${request.id}`);
    } catch (error) {
      console.error(`❌ Error showing ${request.type.toLowerCase()}:`, error);
      alert(`Failed to show ${request.type.toLowerCase()}. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (request: UnifiedRequest) => {
    if (!confirm(`Are you sure you want to delete this ${request.type.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }

    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        // Get post ID from originalData
        const postData = request.originalData as AdminPayment;
        // Delete the post and associated payment
        const response = await fetch(`/api/posts/${postData.post_id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete post: ${errorText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete post');
        }
      } else {
        // Delete the contact unlock request
        const response = await fetch(`/api/contact-unlock-requests/${request.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete contact unlock request: ${errorText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete contact unlock request');
        }
      }
      
      await loadRequests(currentPage, false);
      console.log(`✅ Successfully deleted ${request.type}: ${request.id}`);
    } catch (error) {
      console.error(`❌ Error deleting ${request.type.toLowerCase()}:`, error);
      alert(`Failed to delete ${request.type.toLowerCase()}. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Use a non-blocking notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-pulse';
      toast.textContent = 'Copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // View payment proof
  const viewPaymentProof = (paymentProof: string | null) => {
    if (!paymentProof) return;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const receiptUrl = paymentProof.startsWith('http') 
      ? paymentProof 
      : `${supabaseUrl}/storage/v1/object/public/payment-proofs/${paymentProof}`;
    window.open(receiptUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-32"></div>
        <div className="h-10 bg-muted rounded w-96"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthWrapper>
      <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage post and contact unlock requests</p>
        </div>
        <Button 
          onClick={() => window.location.href = "/post"}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          Create New Post
        </Button>
      </div>

      {/* Mini Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{counts.pending}</p>
              </div>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-600">Approved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{counts.approved}</p>
              </div>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-orange-600">Posts</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-900">{requests.filter(r => r.type === 'Post').length}</p>
              </div>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-purple-600">Contact Unlocks</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{requests.filter(r => r.type === 'Contact Unlock').length}</p>
              </div>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Unlock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Status Filter */}
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({counts.all})</SelectItem>
              <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
              <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
              <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              <SelectItem value="hidden">Hidden ({counts.hidden})</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="contact-unlock">Contact Unlock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-muted-foreground sm:text-right">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[200px]">Details</TableHead>
                  <TableHead className="w-[120px]">Payment</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">Submitted</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow 
                  key={request.id}
                  className={request.status !== "pending" ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.type === "Post" ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium text-sm">
                        {request.type === "Contact Unlock" ? "Contact" : request.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate" title={request.reference}>
                    {request.reference}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      if (request.type === "Post") {
                        const postData = (request.originalData as any)?.posts;
                        
                        if (postData?.employee_photo) {
                          return (
                            <div>
                              <img 
                                src={postData.employee_photo} 
                                alt="Employee" 
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  console.error('❌ Photo failed to load:', postData.employee_photo);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="text-xs text-muted-foreground mt-1">Employee</div>
                            </div>
                          );
                        } else if (postData?.photo_url) {
                          return (
                            <div>
                              <img 
                                src={postData.photo_url} 
                                alt="Post" 
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  console.error('❌ Photo failed to load:', postData.photo_url);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="text-xs text-muted-foreground mt-1">Post</div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No Photo</span>
                            </div>
                          );
                        }
                      } else {
                        return (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">N/A</span>
                          </div>
                        );
                      }
                    })()}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {request.type === "Contact Unlock" && request.contactInfo ? (
                      <div className="space-y-1 text-sm">
                        {request.contactInfo.user_name && (
                          <div className="truncate" title={request.contactInfo.user_name}>
                            <strong>{request.contactInfo.user_name}</strong>
                          </div>
                        )}
                        {request.contactInfo.user_phone && (
                          <div className="text-muted-foreground">{request.contactInfo.user_phone}</div>
                        )}
                        {request.contactInfo.user_email && (
                          <div className="flex items-center gap-1">
                            <div className="text-muted-foreground text-xs truncate" title={request.contactInfo.user_email}>
                              {request.contactInfo.user_email}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(request.contactInfo!.user_email!)}
                              className="h-4 w-4 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : request.type === "Post" && request.postContact ? (
                      <div className={`space-y-1 ${request.paymentProof ? '' : 'opacity-50'}`}>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{request.postContact}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(request.postContact!)}
                            className="h-4 w-4 p-0"
                            disabled={!request.paymentProof}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {!request.paymentProof && (
                          <div className="text-xs text-red-600">⚠️ Verify payment first</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {request.type === "Post" ? (
                      (() => {
                        const postData = (request.originalData as any)?.posts;
                        const details = postData?.details;
                        return details ? (
                          <div className="text-sm line-clamp-3" title={details}>
                            {details}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No details</span>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.paymentProof ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewPaymentProof(request.paymentProof)}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Proof
                          </Button>
                          <Badge className="bg-green-100 text-green-800">
                            ✅ Uploaded
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          ❌ Missing
                        </Badge>
                      )}
                      {request.transactionId && (
                        <Badge variant="secondary" className="text-xs">
                          {request.transactionId}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        request.status === "approved" ? "default" :
                        request.status === "rejected" ? "destructive" :
                        request.status === "hidden" ? "secondary" :
                        "outline"
                      }
                      className={
                        request.status === "approved" ? "bg-green-100 text-green-800" :
                        request.status === "rejected" ? "bg-red-100 text-red-800" :
                        request.status === "hidden" ? "bg-gray-100 text-gray-800" :
                        ""
                      }
                    >
                      {request.status === "approved" && "✅ Approved"}
                      {request.status === "rejected" && "❌ Rejected"}  
                      {request.status === "hidden" && "👁️ Hidden"}
                      {request.status === "pending" && "⏳ Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(request.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700 px-3"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleHide(request)}
                          disabled={processing === request.id}
                          className="px-3"
                        >
                          <EyeOff className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(request)}
                          disabled={processing === request.id}
                          className="px-3"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(request)}
                          disabled={processing === request.id}
                          className="px-3"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {request.status === "approved" && (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Approved
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleHide(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <EyeOff className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {request.status === "rejected" && (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          Rejected
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleHide(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <EyeOff className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {request.status === "hidden" && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Hidden
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShow(request)}
                            disabled={processing === request.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processing === request.id}
                            className="bg-green-600 hover:bg-green-700 px-3"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            disabled={processing === request.id}
                            className="px-3"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No requests found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page change loading indicator */}
      {isPageChanging && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Pagination */}
      <div className="space-y-4">
        {/* Traditional pagination for desktop */}
        <div className="hidden md:block">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={handlePageChange}
            isLoading={isPageChanging}
            totalPosts={totalRequests}
          />
        </div>

        {/* Load more button for mobile */}
        <div className="md:hidden">
          <LoadMoreButton
            hasNextPage={hasNextPage}
            isLoading={isPageChanging}
            onLoadMore={() => handlePageChange(currentPage + 1)}
            remainingPosts={totalRequests - (currentPage * 20)}
          />
        </div>
      </div>
    </div>
    </AdminAuthWrapper>
  );
}
