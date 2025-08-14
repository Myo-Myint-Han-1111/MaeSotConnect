"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, FileText, Send, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Role } from "@/lib/auth/roles";

export default function AdvocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin");
    },
  });
  const router = useRouter();
  const pathname = usePathname();

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const confirmSignOut = () => {
    setIsSignOutDialogOpen(true);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only Youth Advocates can access this section
  if (session?.user?.role !== Role.YOUTH_ADVOCATE) {
    router.push("/auth/signin");
    return null;
  }

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/advocate",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/advocate",
    },
    {
      label: "My Drafts",
      href: "/advocate/drafts",
      icon: <FileText className="h-5 w-5" />,
      active: pathname.startsWith("/advocate/drafts"),
    },
    {
      label: "Create Course",
      href: "/advocate/submit",
      icon: <Send className="h-5 w-5" />,
      active: pathname.startsWith("/advocate/submit"),
    },
    {
      label: "My Profile",
      href: "/advocate/profile",
      icon: <User className="h-5 w-5" />,
      active: pathname.startsWith("/advocate/profile"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 shadow-sm fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">JumpStudy.org</h1>
          <p className="text-sm text-gray-600">Youth Advocate</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                link.active
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-gray-200"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-gray-200 px-3 py-2 rounded-md text-sm"
            onClick={confirmSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 pl-64">
        <main className="pt-5 px-6 pb-12">{children}</main>
      </div>

      <ConfirmationDialog
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}