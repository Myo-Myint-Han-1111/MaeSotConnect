"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center p-4 space-y-8">
      <div className="flex justify-center">
        <Image 
          src="/images/JumpStudyLogo.svg" 
          alt="JumpStudy.org" 
          width={200}
          height={64}
          className="h-16 w-auto"
        />
      </div>
      
      <div className="text-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl rounded-lg p-8">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}