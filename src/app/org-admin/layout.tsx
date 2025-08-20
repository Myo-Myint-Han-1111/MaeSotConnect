"use client"; // ADD THIS

import { useSession } from "next-auth/react"; // CHANGE TO useSession
import { Role } from "@/lib/auth/roles";
import OrgAdminSidebar from "@/components/org-admin/OrgAdminSidebar";
import { useRouter } from "next/navigation"; // ADD THIS
import { useEffect } from "react"; // ADD THIS

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export default function OrgAdminLayout({
  // REMOVE async
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession(); // CHANGE TO useSession
  const router = useRouter(); // ADD THIS

  // MOVE redirect logic to useEffect
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      router.push("/auth/signin");
      return;
    }

    const user = session.user as SessionUser;
    if (!user.organizationId) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // ADD LOADING STATE
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // ADD AUTH CHECK
  if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = session.user as SessionUser;

  if (!user.organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <OrgAdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
