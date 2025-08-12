"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";

type Draft = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  organization?: {
    name: string;
  };
};

export default function AllDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/advocate">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Course Submissions</h1>
            <p className="text-muted-foreground">
              View and manage all your course proposals.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/advocate/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit New Course
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search course titles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={DraftStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={DraftStatus.PENDING}>Pending Review</SelectItem>
                <SelectItem value={DraftStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={DraftStatus.REJECTED}>Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drafts List */}
      <div className="space-y-4">
        {filteredDrafts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {drafts.length === 0 ? (
                  <>
                    <p className="text-muted-foreground mb-4">You haven&apos;t submitted any courses yet.</p>
                    <Button asChild>
                      <Link href="/advocate/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Submit Your First Course
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No courses match your current filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDrafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(draft.status)}
                      <h3 className="text-lg font-medium">{draft.title}</h3>
                      <Badge className={getStatusBadgeColor(draft.status)}>
                        {draft.status === DraftStatus.REJECTED ? "Needs Revision" : draft.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Type: {draft.type.replace("_", " ")}</p>
                      <p>Submitted: {new Date(draft.submittedAt).toLocaleDateString()}</p>
                      {draft.reviewedAt && (
                        <p>Reviewed: {new Date(draft.reviewedAt).toLocaleDateString()}</p>
                      )}
                      {draft.organization && (
                        <p>Organization: {draft.organization.name}</p>
                      )}
                    </div>

                    {draft.reviewNotes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Review Notes:</p>
                        <p className="text-sm">{draft.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/advocate/drafts/${draft.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredDrafts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDrafts.length} of {drafts.length} course submissions
        </div>
      )}
    </div>
  );
}