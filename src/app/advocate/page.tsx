"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";

type DraftSummary = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  submittedAt: string;
  reviewedAt?: string;
};

export default function AdvocateDashboard() {
  const { data: session } = useSession();
  const [recentDrafts, setRecentDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      if (response.ok) {
        const drafts = await response.json();
        setRecentDrafts(drafts.slice(0, 5)); // Show last 5 drafts
        
        // Calculate stats
        const stats = drafts.reduce(
          (acc: { total: number; pending: number; approved: number; rejected: number }, draft: DraftSummary) => {
            acc.total++;
            switch (draft.status) {
              case DraftStatus.PENDING:
                acc.pending++;
                break;
              case DraftStatus.APPROVED:
                acc.approved++;
                break;
              case DraftStatus.REJECTED:
                acc.rejected++;
                break;
            }
            return acc;
          },
          { total: 0, pending: 0, approved: 0, rejected: 0 }
        );
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.DRAFT:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case DraftStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case DraftStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case DraftStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case DraftStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Submit course proposals and track their approval status.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/advocate/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit Course
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/advocate/drafts">
            <FileText className="mr-2 h-4 w-4" />
            View All Drafts
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Revision</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Your latest course submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDrafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven&apos;t submitted any courses yet.</p>
                <Button asChild>
                  <Link href="/advocate/submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your First Course
                  </Link>
                </Button>
              </div>
            ) : (
              recentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(draft.status)}
                      <h3 className="font-medium">{draft.title}</h3>
                      <Badge className={getStatusBadgeColor(draft.status)}>
                        {draft.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type: {draft.type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(draft.submittedAt).toLocaleDateString()}
                    </p>
                    {draft.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed: {new Date(draft.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/advocate/drafts/${draft.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
          {recentDrafts.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/advocate/drafts">View All Submissions</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}