"use client";

import { useState, useEffect } from "react";
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
import { Eye, CheckCircle, XCircle, FileText, Unlock } from "lucide-react";
import { getAllAdminPayments, updateAdminPaymentStatus, type AdminPayment } from "@/lib/admin-payments";
import { getAllUnlockRequests, approveUnlockRequest, rejectUnlockRequest, type ContactUnlockRequest } from "@/lib/unlock-requests";

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
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "hidden">("pending");
  const [typeFilter, setTypeFilter] = useState<"all" | "post" | "contact-unlock">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  // Load all requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get payments (post requests)
      const { payments: paymentData } = await getAllAdminPayments();
      
      // Get unlock requests
      const { requests: unlockData } = await getAllUnlockRequests();
      
      // Transform to unified format
      const unifiedRequests: UnifiedRequest[] = [];
      
      // Add payment requests as "Post" type
      paymentData?.forEach((payment: AdminPayment) => {
        unifiedRequests.push({
          id: payment.id,
          type: "Post",
          reference: payment.posts?.work || "Unknown Post",
          user: "", // No user for post requests
          paymentProof: payment.receipt_url,
          transactionId: payment.reference_id,
          submittedAt: payment.created_at,
          status: payment.status,
          originalData: payment
        });
      });
      
      // Add unlock requests as "Contact Unlock" type
      unlockData?.forEach((unlock: ContactUnlockRequest) => {
        unifiedRequests.push({
          id: unlock.id,
          type: "Contact Unlock",
          reference: unlock.post_title || "Unknown Post",
          user: unlock.visitor_id || "",
          paymentProof: unlock.payment_proof || undefined,
          transactionId: unlock.transaction_id || undefined,
          submittedAt: unlock.created_at,
          status: unlock.status as "pending" | "approved" | "rejected" | "hidden",
          originalData: unlock
        });
      });
      
      // Sort by submitted date (newest first)
      unifiedRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setRequests(unifiedRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const statusMatch = filter === "all" || request.status === filter;
    const typeMatch = typeFilter === "all" || 
      (typeFilter === "post" && request.type === "Post") ||
      (typeFilter === "contact-unlock" && request.type === "Contact Unlock");
    return statusMatch && typeMatch;
  });

  // Get counts for tabs
  const getCounts = () => ({
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    hidden: requests.filter(r => r.status === "hidden").length,
  });

  const counts = getCounts();

  // Handle approve/reject
  const handleApprove = async (request: UnifiedRequest) => {
    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        await updateAdminPaymentStatus(request.id, "approved");
      } else {
        await approveUnlockRequest(request.id);
      }
      await loadRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: UnifiedRequest) => {
    setProcessing(request.id);
    try {
      if (request.type === "Post") {
        await updateAdminPaymentStatus(request.id, "rejected");
      } else {
        await rejectUnlockRequest(request.id);
      }
      await loadRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Requests</h1>
        <p className="text-muted-foreground">Manage post and contact unlock requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "hidden", label: "Hidden" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            onClick={() => setFilter(tab.key as typeof filter)}
            className="rounded-full"
          >
            {tab.label}
            <Badge variant="secondary" className="ml-2">
              {counts[tab.key as keyof typeof counts]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={typeFilter} onValueChange={(value: "all" | "post" | "contact-unlock") => setTypeFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="contact-unlock">Contact Unlock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Payment Proof</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Action</TableHead>
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
                      <span className="font-medium">
                        {request.type === "Contact Unlock" && (
                          <span>Contact<br />Unlock</span>
                        )}
                        {request.type === "Post" && "Post"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.reference}
                  </TableCell>
                  <TableCell>
                    {request.user || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Proof
                      </Button>
                      {request.transactionId && (
                        <Badge variant="secondary" className="text-xs">
                          {request.transactionId}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(request.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request)}
                          disabled={processing === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {request.status === "approved" && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    )}
                    {request.status === "rejected" && (
                      <Badge variant="destructive">
                        Rejected
                      </Badge>
                    )}
                    {request.status === "hidden" && (
                      <Badge variant="secondary">
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No requests found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
