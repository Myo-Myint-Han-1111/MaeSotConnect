"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  LogOut,
  Building2,
  BookOpen,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog"; // Add this import

export default function AdminLayout({
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

  // Add state for sign out confirmation dialog
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";

  // Add these functions for sign out confirmation
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

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    ...(isPlatformAdmin
      ? [
          {
            label: "Organizations",
            href: "/admin/organizations",
            icon: <Building2 className="h-5 w-5" />,
            active: pathname.startsWith("/admin/organizations"),
          },
          {
            label: "Users",
            href: "/admin/users",
            icon: <Users className="h-5 w-5" />,
            active: pathname.startsWith("/admin/users"),
          },
        ]
      : []),
    {
      label: "Courses",
      href: "/dashboard/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/courses"),
    },
    ...(session?.user?.role === "ORGANIZATION_ADMIN" &&
    session?.user?.organizationId
      ? [
          {
            label: "Admins",
            href: "/dashboard/admins",
            icon: <Users className="h-5 w-5" />,
            active: pathname.startsWith("/dashboard/admins"),
          },
        ]
      : []),
    {
      label: "Account",
      href: "/dashboard/account",
      icon: <User className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/account"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm fixed h-full z-10">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Mae Sot Connect</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                link.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-gray-100"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {/* Update Sign Out button to use confirmSignOut */}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-gray-100 px-3 py-2 rounded-md text-sm"
            onClick={confirmSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 pl-64">
        <header className="h-16 bg-white shadow-sm fixed w-full z-10 pl-64 flex items-center px-6 justify-between">
          <h2 className="text-lg font-medium">
            {isPlatformAdmin ? "Platform Admin" : "Organization Admin"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>
        <main className="pt-24 px-6 pb-12">{children}</main>
      </div>

      {/* Add Sign Out Confirmation Dialog */}
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
