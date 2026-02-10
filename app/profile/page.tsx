"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(appConfig.routes.adminProfile);
  }, [router]);

  return null;
}
