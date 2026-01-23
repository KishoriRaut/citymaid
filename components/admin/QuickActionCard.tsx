"use client";

import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  description?: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export function QuickActionCard({ title, description, href, icon, badge }: QuickActionCardProps) {
  return (
    <Link href={href} className="block">
      <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 h-full">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {badge !== undefined && badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
