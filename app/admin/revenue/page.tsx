"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getAllAdminPayments, 
  updateAdminPaymentStatus, 
  type AdminPayment
} from "@/lib/admin-payments";
import {
  getAllHomepagePayments,
  approveHomepagePayment,
  rejectHomepagePayment
} from "@/lib/homepage-payments";

// Extended Payment interface with post data
interface PaymentWithPost extends AdminPayment {
  posts?: {
    work: string;
    post_type: string;
    contact: string;
  };
}

// Unified transaction interface
interface UnifiedTransaction {
  id: string;
  type: "contact_unlock" | "homepage_feature";
  postId: string;
  postType: "employer" | "employee";
  work: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  visitorId: string | null;
  customerName?: string | null;
  receiptUrl?: string | null;
  paymentProof?: string | null;
  createdAt: string;
  contact?: string;
  photoUrl?: string | null;
}

export default function RevenueDashboardPage() {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "contact_unlock" | "homepage_feature">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    pendingTransactions: 0,
    approvedTransactions: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    loadTransactions();
    loadMetrics();
  }, [typeFilter, statusFilter]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Load contact unlock payments
      const { payments: contactPayments, error: contactError } = await getAllAdminPayments() as { payments?: PaymentWithPost[], error?: string };
      
      // Load homepage feature payments
      const { requests: homepagePayments, error: homepageError } = await getAllHomepagePayments();
      
      if (contactError || homepageError) {
        setError("Failed to load transactions");
        return;
      }

      // Transform to unified format
      const unifiedTransactions: UnifiedTransaction[] = [];
      
      // Add contact unlock payments
      contactPayments?.forEach(payment => {
        unifiedTransactions.push({
          id: payment.id,
          type: "contact_unlock",
          postId: payment.post_id,
          postType: payment.posts?.post_type as "employer" | "employee" || "employee",
          work: payment.posts?.work || "Unknown",
          amount: payment.amount,
          status: payment.status,
          visitorId: payment.visitor_id || null,
          customerName: payment.customer_name,
          receiptUrl: payment.receipt_url,
          createdAt: payment.created_at,
          contact: payment.posts?.contact
        });
      });
      
      // Add homepage feature payments
      homepagePayments?.forEach(payment => {
        if (payment.homepage_payment_status !== 'none') {
          unifiedTransactions.push({
            id: `hp_${payment.id}`,
            type: "homepage_feature",
            postId: payment.id,
            postType: payment.post_type,
            work: payment.work,
            amount: 500, // Fixed homepage feature price
            status: payment.homepage_payment_status as "pending" | "approved" | "rejected",
            visitorId: null,
            customerName: null,
            receiptUrl: null,
            paymentProof: payment.payment_proof,
            createdAt: payment.created_at,
            contact: payment.contact,
            photoUrl: payment.photo_url
          });
        }
      });
      
      // Sort by date (newest first)
      unifiedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTransactions(unifiedTransactions);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { payments: contactPayments } = await getAllAdminPayments() as { payments?: PaymentWithPost[] };
      const { requests: homepagePayments } = await getAllHomepagePayments();
      
      const contactTransactions = contactPayments || [];
      const homepageTransactions = homepagePayments?.filter(p => p.homepage_payment_status !== 'none') || [];
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthContactTransactions = contactTransactions.filter(t => {
        const date = new Date(t.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const thisMonthHomepageTransactions = homepageTransactions.filter(t => {
        const date = new Date(t.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const totalRevenue = contactTransactions.reduce((sum, t) => sum + t.amount, 0) + (homepageTransactions.length * 500);
      const thisMonthRevenue = thisMonthContactTransactions.reduce((sum, t) => sum + t.amount, 0) + (thisMonthHomepageTransactions.length * 500);
      
      const pendingCount = contactTransactions.filter(t => t.status === 'pending').length + 
                          homepageTransactions.filter(t => t.homepage_payment_status === 'pending').length;
      
      const approvedCount = contactTransactions.filter(t => t.status === 'approved').length + 
                           homepageTransactions.filter(t => t.homepage_payment_status === 'approved').length;
      
      setMetrics({
        totalRevenue,
        thisMonthRevenue,
        pendingTransactions: pendingCount,
        approvedTransactions: approvedCount,
        totalTransactions: contactTransactions.length + homepageTransactions.length
      });
    } catch {
      console.error("Error loading metrics");
    }
  };

  const handleApprove = async (transaction: UnifiedTransaction) => {
    setProcessing(transaction.id);
    try {
      if (transaction.type === "contact_unlock") {
        await updateAdminPaymentStatus(transaction.id, "approved");
      } else {
        await approveHomepagePayment(transaction.id.replace("hp_", ""));
      }
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: "approved" } : t
      ));
      
      loadMetrics();
    } catch {
      setError("Failed to approve transaction");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transaction: UnifiedTransaction) => {
    setProcessing(transaction.id);
    try {
      if (transaction.type === "contact_unlock") {
        await updateAdminPaymentStatus(transaction.id, "rejected");
      } else {
        await rejectHomepagePayment(transaction.id.replace("hp_", ""));
      }
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: "rejected" } : t
      ));
      
      loadMetrics();
    } catch {
      setError("Failed to reject transaction");
    } finally {
      setProcessing(null);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      transaction.work.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.postId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Manage all transactions and revenue in one place</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.thisMonthRevenue)}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{metrics.pendingTransactions}</p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">{metrics.approvedTransactions}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalTransactions}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by work type or post ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            
            <div className="lg:w-48">
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | "contact_unlock" | "homepage_feature")}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="all">All Types</option>
                <option value="contact_unlock">Contact Unlock</option>
                <option value="homepage_feature">Homepage Feature</option>
              </select>
            </div>
            
            <div className="lg:w-48">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Transactions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadTransactions} className="mt-4">Retry</Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/25">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{transaction.work}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.postType === "employer" ? "Job" : "Profile"} • ID: {transaction.postId.slice(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === "contact_unlock" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        }`}>
                          {transaction.type === "contact_unlock" ? "Contact Unlock" : "Homepage Feature"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "approved" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{formatDate(transaction.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {transaction.status === "pending" && (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(transaction)}
                              disabled={processing === transaction.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processing === transaction.id ? "..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(transaction)}
                              disabled={processing === transaction.id}
                            >
                              {processing === transaction.id ? "..." : "Reject"}
                            </Button>
                          </div>
                        )}
                        {transaction.status === "approved" && (
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" disabled>
                              Approved
                            </Button>
                          </div>
                        )}
                        {transaction.status === "rejected" && (
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" disabled>
                              Rejected
                            </Button>
                          </div>
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
  );
}
