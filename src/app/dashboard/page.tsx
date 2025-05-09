"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BookOpen, Users } from "lucide-react";

interface DashboardStats {
  organizations: number;
  courses: number;
  users: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    organizations: 0,
    courses: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const isPlatformAdmin = session?.user?.role === "PLATFORM_ADMIN";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isPlatformAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.organizations
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total organizations in the system
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stats.courses
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPlatformAdmin
                ? "Total courses across all organizations"
                : "Courses in your organization"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stats.users
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPlatformAdmin
                ? "Total administrators in the system"
                : "Administrators in your organization"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Welcome, {session?.user?.name}
        </h2>
        <p className="text-muted-foreground">
          You are logged in as a{" "}
          <span className="font-medium text-foreground">
            {isPlatformAdmin
              ? "Platform Administrator"
              : "Organization Administrator"}
          </span>
          .
        </p>
        {isPlatformAdmin ? (
          <p className="mt-2 text-muted-foreground">
            As a Platform Administrator, you have full access to manage
            organizations, courses, and users across the entire system. Use the
            sidebar navigation to access different sections of the admin
            dashboard.
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">
            As an Organization Administrator, you can manage courses for your
            organization. Use the sidebar navigation to access your courses and
            account settings.
          </p>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isPlatformAdmin ? (
              <>
                <Card
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    (window.location.href = "/admin/organizations")
                  }
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span>Manage Organizations</span>
                  </CardContent>
                </Card>
                <Card
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = "/admin/users")}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Manage Users</span>
                  </CardContent>
                </Card>
              </>
            ) : null}
            <Card
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => (window.location.href = "/dashboard/courses")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <span>Manage Courses</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">System Updates</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <p className="text-sm font-medium">
              Welcome to the new Admin Dashboard
            </p>
            <p className="text-xs text-muted-foreground">
              We have redesigned the admin interface to make course and
              organization management easier.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-1">
            <p className="text-sm font-medium">Course Management System</p>
            <p className="text-xs text-muted-foreground">
              You can now create and manage courses with a streamlined form
              interface.
            </p>
          </div>
          <div className="border-l-4 border-amber-500 pl-4 py-1">
            <p className="text-sm font-medium">Need Help?</p>
            <p className="text-xs text-muted-foreground">
              Check the documentation or contact support if you need assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
