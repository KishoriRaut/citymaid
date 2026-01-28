"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";

interface EmptyStateProps {
  activeTab: "all" | "employer" | "employee";
}

export function EmptyState({ activeTab }: EmptyStateProps) {
  const isHiring = activeTab === "employer";

  return (
    <div className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-10 h-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">
          {isHiring
            ? "No job listings yet"
            : "No job seekers yet"}
        </h2>

        <p className="text-muted-foreground mb-6 text-lg">
          {isHiring
            ? "Be the first to post a job and find help fast."
            : "Create your profile and get contacted by employers."}
        </p>

        <Link href={appConfig.routes.post}>
          <Button size="lg" className="px-8">
            {isHiring ? "➕ Post a Job" : "➕ Find a Job"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
