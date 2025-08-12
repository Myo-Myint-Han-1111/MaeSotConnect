"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/auth/roles";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not authenticated, redirect to signin
      router.replace("/auth/signin");
      return;
    }

    // Redirect based on user role
    const userRole = session.user?.role;

    switch (userRole) {
      case Role.PLATFORM_ADMIN:
        router.replace("/dashboard");
        break;
      case Role.YOUTH_ADVOCATE:
        router.replace("/advocate");
        break;
      case Role.ORGANIZATION_ADMIN:
        // TODO: Add organization admin dashboard when available
        router.replace("/advocate"); // For now, redirect to advocate page
        break;
      default:
        // Unknown role or no role, redirect to signin
        router.replace("/auth/signin");
        break;
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}