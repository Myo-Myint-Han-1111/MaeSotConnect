"use client";

// components/org-admin/OrgAdminSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  FileText,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

interface OrgAdminSidebarProps {
  user: User;
}

const navigation = [
  { name: "Dashboard", href: "/org-admin/dashboard", icon: LayoutDashboard },
  { name: "Organization Profile", href: "/org-admin/profile", icon: Building2 },
  { name: "Courses", href: "/org-admin/courses", icon: BookOpen },
  { name: "My Drafts", href: "/org-admin/drafts", icon: FileText },
];

export default function OrgAdminSidebar({ user: _user }: OrgAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Organization Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Sign Out Button - Moved here under navigation items */}
        <button
          onClick={() => signOut()}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Sign out
        </button>
      </nav>
    </div>
  );
}
