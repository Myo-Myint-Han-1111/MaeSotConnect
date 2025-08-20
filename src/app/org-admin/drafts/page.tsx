"use client";

// app/org-admin/drafts/page.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, Edit, Eye } from "lucide-react";
import { DraftStatus, DraftType } from "@/lib/auth/roles";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  type: DraftType;
  content: Record<string, unknown>;
  status: DraftStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  organization?: {
    name: string;
  };
}

export default function OrgAdminDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");

      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }

      const data = await response.json();
      setDrafts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch drafts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: DraftStatus) => {
    switch (status) {
      case DraftStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case DraftStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case DraftStatus.DRAFT:
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DraftStatus) => {
    const classNames = {
      [DraftStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [DraftStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200",
      [DraftStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
      [DraftStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        className={
          classNames[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {status.toLowerCase().replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchDrafts} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
        <p className="text-gray-600 mt-1">
          Track your submitted courses and their review status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(DraftStatus).map((status) => {
          const count = drafts.filter(
            (draft) => draft.status === status
          ).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">
                      {status.toLowerCase().replace("_", " ")}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  {getStatusIcon(status)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-gray-600 mb-4">
              Create a course and it will appear here for review.
            </p>
            <Link href="/org-admin/courses/new">
              <Button>Create Your First Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{draft.title}</CardTitle>
                      {getStatusBadge(draft.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {draft.type}
                      </span>
                      <span>
                        Submitted:{" "}
                        {new Date(draft.submittedAt).toLocaleDateString()}
                      </span>
                      {draft.reviewedAt && (
                        <span>
                          Reviewed:{" "}
                          {new Date(draft.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/org-admin/drafts/${draft.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {draft.status === DraftStatus.REJECTED && (
                      <Link href={`/org-admin/drafts/${draft.id}/edit`}>
                        <Button size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Revise
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {draft.reviewNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Review Notes:
                    </p>
                    <p className="text-sm text-gray-600">{draft.reviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
