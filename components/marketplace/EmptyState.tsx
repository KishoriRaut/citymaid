"use client";

import Link from "next/link";
import { Button } from "@/components/shared/button";
import { appConfig } from "@/lib/config";
import { FileText } from "lucide-react";

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
            <FileText className="w-10 h-10 text-muted-foreground" />
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
