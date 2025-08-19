"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BookOpen, FileText, Clock } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  organizations: number;
  courses: number;
  pendingDrafts: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    organizations: 0,
    courses: 0,
    pendingDrafts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch organization count
        const orgResponse = await fetch('/api/organizations', {
          cache: 'no-store'
        });
        const organizations = await orgResponse.json();

        // Fetch course count
        const courseResponse = await fetch('/api/courses', {
          cache: 'no-store'
        });
        const courses = await courseResponse.json();

        // Fetch pending drafts count (both course and organization drafts)
        const draftsResponse = await fetch('/api/admin/drafts', {
          cache: 'no-store'
        });
        const drafts = await draftsResponse.json();
        // Count all pending drafts (courses and organizations) that need review
        const pendingDrafts = Array.isArray(drafts) ? drafts.filter(draft => draft.status === "PENDING").length : 0;

        setStats({
          organizations: organizations.length,
          courses: courses.length,
          pendingDrafts,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
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

        <Card className="bg-white">
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
              Total courses across all organizations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stats.pendingDrafts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Course and organization drafts awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Welcome, {session?.user?.name}
        </h2>
        <p className="text-muted-foreground">
          You are logged in as a Platform Administrator.
        </p>
        <p className="mt-2 text-muted-foreground">
          As a Platform Administrator, you have full access to manage
          organizations and courses across the entire system. Use the sidebar
          navigation to access different sections of the admin dashboard.
        </p>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/organizations">
              <Card className="bg-white hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span>Manage Organizations</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/courses">
              <Card className="bg-white hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span>Manage Courses</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/drafts">
              <Card className="bg-white hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  <div className="flex flex-col items-start">
                    <span>Review Drafts</span>
                    {stats.pendingDrafts > 0 && (
                      <span className="text-xs text-yellow-600 font-medium">
                        {stats.pendingDrafts} pending
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
