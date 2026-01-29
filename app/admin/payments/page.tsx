"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllAdminPayments, updateAdminPaymentStatus, type AdminPayment } from "@/lib/admin-payments";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";

interface PaymentWithPost extends AdminPayment {
  posts?: {
    work: string;
    post_type: string;
    contact: string;
  };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentWithPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { payments: fetchedPayments, error: fetchError } = await getAllAdminPayments();

      if (fetchError) {
        setError(fetchError);
        setIsLoading(false);
        return;
      }

      setPayments(fetchedPayments as PaymentWithPost[]);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payments");
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPayments();
  }, [filter, loadPayments]);

  const handleStatusChange = async (
    paymentId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const { error: updateError } = await updateAdminPaymentStatus(paymentId, newStatus);
      if (updateError) {
        alert(`Error: ${updateError}`);
        return;
      }
      loadPayments();
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Payments Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve payment requests
            </p>
          </div>
          <Button onClick={() => router.push(appConfig.routes.admin)} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 border rounded-md p-1 bg-background w-fit">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {/* Payments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No payments found</div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentCard({
  payment,
  onStatusChange,
}: {
  payment: PaymentWithPost;
  onStatusChange: (paymentId: string, status: "approved" | "rejected") => void;
}) {
  const post = payment.posts;

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                payment.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : payment.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {payment.status}
            </span>
          </div>

          {post && (
            <h3 className="font-semibold text-lg mb-2">{post.work}</h3>
          )}

          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            <p>
              <span className="font-medium">Amount:</span> NRs. {payment.amount.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Method:</span> {payment.method.toUpperCase()}
            </p>
            {payment.customer_name && (
              <p>
                <span className="font-medium">Customer Name:</span> {payment.customer_name}
              </p>
            )}
            {payment.receipt_url && (
              <p>
                <span className="font-medium">Receipt:</span>{" "}
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Receipt
                </a>
              </p>
            )}
            {payment.reference_id && (
              <p>
                <span className="font-medium">Reference ID:</span> {payment.reference_id}
              </p>
            )}
            {payment.visitor_id && (
              <p>
                <span className="font-medium">Visitor ID:</span> {payment.visitor_id}
              </p>
            )}
            {post && (
              <p>
                <span className="font-medium">Post Contact:</span> {post.contact}
              </p>
            )}
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(payment.created_at).toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          {payment.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange(payment.id, "approved")}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => onStatusChange(payment.id, "rejected")}
                size="sm"
                variant="destructive"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
