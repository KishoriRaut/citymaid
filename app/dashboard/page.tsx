"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(appConfig.routes.admin);
  }, [router]);

  return null;
}
