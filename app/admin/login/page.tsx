"use client";

import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();

  // Immediate redirect without loading state
  if (typeof window !== 'undefined') {
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Redirecting to login...</h2>
      </div>
    </div>
  );
}
