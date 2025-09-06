// src/app/org-admin/drafts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Copy,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import { DraftStatus, DraftType } from "@/lib/auth/roles";

import Link from "next/link";
import Image from "next/image";

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
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function OrgAdminDraftsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "ORGANIZATION_ADMIN") {
      fetchDrafts();
    }
  }, [session]);

  const fetchDrafts = async () => {
    try {
      // Use the existing org-admin endpoint
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

  // NEW: Handle copy functionality
  const handleCopy = async (draftId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}/copy`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        await fetchDrafts();
        alert(`Draft copied successfully as "${result.draft.title}"`);
      } else {
        const error = await response.json();
        alert(`Error copying draft: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error copying draft:", error);
      alert("Error copying draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW: Handle delete functionality
  const handleDelete = async (draftId: string, draftTitle: string) => {
    if (isProcessing) return;

    if (!confirm(`Delete "${draftTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDrafts();
      } else {
        const error = await response.json();
        alert(`Error deleting draft: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error deleting draft. Please try again.");
    } finally {
      setIsProcessing(false);
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
        {status === DraftStatus.REJECTED
          ? "Needs Revision"
          : status.toLowerCase().replace("_", " ")}
      </Badge>
    );
  };

  // Filter drafts based on search term and status
  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = draft.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Loading state during authentication
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Role check
  if (session?.user?.role !== "ORGANIZATION_ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be an organization admin to access this page.
        </p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
          <p className="text-gray-600 mt-1">
            Track your submitted courses and their review status
          </p>
        </div>
        <Button asChild className="hover:bg-blue-700 hover:text-white">
          <Link href="/org-admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* NEW: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search drafts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Needs Revision</SelectItem>
          </SelectContent>
        </Select>
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
                      {status === DraftStatus.REJECTED
                        ? "Needs Revision"
                        : status.toLowerCase().replace("_", " ")}
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
      {filteredDrafts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No matching drafts found"
                : "No drafts yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create a course and it will appear here for review."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/org-admin/courses/new">
                <Button>Create Your First Course</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const content = draft.content as Record<string, unknown>;
            const imageUrls = content?.imageUrls;
            const hasImage =
              imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0;
            const firstImageUrl = hasImage ? (imageUrls as string[])[0] : null;

            return (
              <Card
                key={draft.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Course Image */}
                        <div className="flex-shrink-0">
                          {firstImageUrl ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                              <Image
                                src={firstImageUrl}
                                alt={draft.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg truncate">
                              {draft.title}
                            </CardTitle>
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
                                {new Date(
                                  draft.reviewedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                            {draft.author && (
                              <span>By: {draft.author.name}</span>
                            )}
                          </div>

                          {/* Course Details */}
                          {content?.subtitle &&
                          typeof content.subtitle === "string" ? (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {content.subtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      {/* Edit/Revise Button */}
                      {(draft.status === DraftStatus.REJECTED ||
                        draft.status === DraftStatus.DRAFT) && (
                        <Link href={`/org-admin/drafts/${draft.id}/edit`}>
                          <Button
                            size="sm"
                            className="hover:bg-blue-700 hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {draft.status === DraftStatus.REJECTED
                              ? "Revise"
                              : "Edit"}
                          </Button>
                        </Link>
                      )}

                      {/* View Button */}
                      <Link href={`/org-admin/drafts/${draft.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>

                      {/* NEW: Copy Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-50 hover:text-gray-700"
                        onClick={() => handleCopy(draft.id)}
                        disabled={isProcessing}
                        title="Copy this draft"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* NEW: Delete Button - Only for non-approved drafts */}
                      {draft.status !== DraftStatus.APPROVED && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(draft.id, draft.title)}
                          disabled={isProcessing}
                          title="Delete this draft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {draft.reviewNotes && (
                  <CardContent>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Review Notes:
                      </p>
                      <p className="text-sm text-gray-600">
                        {draft.reviewNotes}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredDrafts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDrafts.length} of {drafts.length} submissions
        </div>
      )}
    </div>
  );
}
