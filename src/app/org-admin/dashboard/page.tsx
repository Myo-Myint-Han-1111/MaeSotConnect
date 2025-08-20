// app/org-admin/dashboard/page.tsx
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BookOpen, FileText, Users } from "lucide-react";
import Link from "next/link";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

async function getOrganizationStats(organizationId: string) {
  const [coursesCount, draftsCount, usersCount, organization] =
    await Promise.all([
      prisma.course.count({
        where: { organizationId },
      }),
      prisma.contentDraft.count({
        where: { organizationId },
      }),
      prisma.user.count({
        where: { organizationId },
      }),
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, description: true },
      }),
    ]);

  return {
    courses: coursesCount,
    drafts: draftsCount,
    users: usersCount,
    organization,
  };
}

export default async function OrgAdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
    redirect("/auth/signin");
  }

  const user = session.user as SessionUser;

  if (!user.organizationId) {
    redirect("/auth/signin");
  }

  const stats = await getOrganizationStats(user.organizationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Organization Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.name}! Manage your organization&apos;s courses and
          profile.
        </p>
        {stats.organization && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900">
              {stats.organization.name}
            </h2>
            <p className="text-sm text-blue-700 mt-1">
              {stats.organization.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">
              Courses published by your organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              Courses awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              Users in your organization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/org-admin/courses/new"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Create New Course</div>
                  <div className="text-sm text-gray-600">
                    Add a new course for your organization
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/org-admin/profile"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Update Organization Profile</div>
                  <div className="text-sm text-gray-600">
                    Modify your organization details
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                📚 You have {stats.courses} published courses
              </div>
              <div className="text-sm text-gray-600">
                ✏️ You have {stats.drafts} courses in draft status
              </div>
              <div className="text-sm text-gray-600">
                👥 Your organization has {stats.users} team members
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
