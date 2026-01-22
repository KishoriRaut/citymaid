"use client";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  status?: "pending" | "approved" | "hidden" | "default";
  loading?: boolean;
}

export function MetricCard({ title, value, icon, status = "default", loading = false }: MetricCardProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    hidden: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    default: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${statusColors[status]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
