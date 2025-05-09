"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminEditRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;
  const adminId = params.adminId as string;

  useEffect(() => {
    // Redirect to the central user edit page with context parameters
    router.replace(
      `/admin/users/${adminId}/edit?from=org&orgId=${organizationId}`
    );
  }, [router, adminId, organizationId]);

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
}
