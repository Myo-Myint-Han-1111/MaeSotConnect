"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowLeft, Search, Undo2, Edit, Trash2, Copy, Building, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DraftStatus } from "@/lib/auth/roles";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

type Draft = {
  id: string;
  title: string;
  type: string;
  content: Record<string, unknown>;
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
  const [pullBackDialogOpen, setPullBackDialogOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/drafts", {
        cache: 'no-store'
      });
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

  const handlePullBack = (draftId: string) => {
    setSelectedDraftId(draftId);
    setPullBackDialogOpen(true);
  };

  const confirmPullBack = async () => {
    if (!selectedDraftId) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${selectedDraftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "DRAFT"
        }),
      });

      if (response.ok) {
        // Refresh the drafts list
        await fetchDrafts();
        setPullBackDialogOpen(false);
        setSelectedDraftId(null);
      } else {
        const error = await response.json();
        alert(`Error pulling back draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error pulling back draft:", error);
      alert("Error pulling back draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
        // Refresh the drafts
        await fetchDrafts();
      } else {
        const error = await response.json();
        alert(`Error deleting draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error deleting draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async (draftId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/drafts/${draftId}/copy`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the drafts to show the new copy
        await fetchDrafts();
        alert(`Draft copied successfully as "${result.draft.title}"`);
      } else {
        const error = await response.json();
        alert(`Error copying draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error copying draft:", error);
      alert("Error copying draft. Please try again.");
    } finally {
      setIsProcessing(false);
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
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="hover:text-gray-500">
          <Link href="/advocate">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Submissions</h1>
          <p className="text-muted-foreground">
            View and manage all your course and organization drafts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-700 hover:bg-blue-600 text-white">
            <Link href="/advocate/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit New Course
            </Link>
          </Button>
          <Button variant="outline" asChild className="hover:bg-gray-50 hover:text-gray-700">
            <Link href="/advocate/organizations/submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search titles..."
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrafts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {drafts.length === 0 ? (
                  <>
                    <p className="text-muted-foreground mb-4">You haven&apos;t submitted any courses or organizations yet.</p>
                    <Button asChild>
                      <Link href="/advocate/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Submit Your First Course
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No submissions match your current filters.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDrafts.map((draft) => {
            const content = draft.content as { 
              imageUrls?: string[]; 
              subtitle?: string; 
              description?: string;
              logoImageUrl?: string;
            };
            const firstImage = draft.type === "ORGANIZATION" ? content?.logoImageUrl : content?.imageUrls?.[0];
            const subtitle = content?.subtitle || content?.description;
            
            return (
              <Card key={draft.id} className="max-w-md p-4 border border-gray-200 rounded-lg flex flex-col bg-white">
                <CardContent className="p-0 flex flex-col flex-1">
                      {/* Type Label */}
                      <div className="flex items-center gap-2 mb-3">
                        {draft.type === "ORGANIZATION" ? (
                          <Building className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                          {draft.type === "ORGANIZATION" ? "Organization" : "Course"}
                        </span>
                      </div>

                      {/* Image Preview */}
                      {firstImage && (
                        <div className="mb-3">
                          <Image
                            src={firstImage}
                            alt={draft.title}
                            width={400}
                            height={128}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}

                      {/* Title and Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(draft.status)}
                        <h3 className="text-lg font-medium">{draft.title}</h3>
                      </div>
                      
                      {/* Status Badge on its own line */}
                      <div className="mb-3">
                        <Badge className={getStatusBadgeColor(draft.status)}>
                          {draft.status === DraftStatus.REJECTED ? "Needs Revision" : draft.status}
                        </Badge>
                      </div>

                      {/* Subtitle/Description */}
                      {subtitle && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {String(subtitle)}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Submitted: {new Date(draft.submittedAt).toLocaleDateString()}</p>
                        {draft.reviewedAt && (
                          <p>Reviewed: {new Date(draft.reviewedAt).toLocaleDateString()}</p>
                        )}
                        {draft.organization && (
                          <p>Organization: {draft.organization.name}</p>
                        )}
                      </div>

                      {/* Review Notes */}
                      {draft.reviewNotes && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Review Notes:</p>
                          <p className="text-sm italic">{draft.reviewNotes}</p>
                        </div>
                      )}
                    
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {/* Primary Edit Actions */}
                      {draft.status === "DRAFT" && (
                        <Button 
                          size="sm" 
                          asChild
                          className="hover:bg-blue-700 hover:text-white"
                        >
                          <Link href={draft.type === "ORGANIZATION" ? `/advocate/organizations/submit?edit=${draft.id}` : `/advocate/submit?edit=${draft.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                      {draft.status === "REJECTED" && (
                        <Button 
                          size="sm" 
                          asChild
                          className="hover:bg-blue-700 hover:text-white"
                        >
                          <Link href={draft.type === "ORGANIZATION" ? `/advocate/organizations/submit?edit=${draft.id}` : `/advocate/submit?edit=${draft.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Revise
                          </Link>
                        </Button>
                      )}
                      {draft.status === "PENDING" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-gray-50 hover:text-gray-700"
                          onClick={() => handlePullBack(draft.id)}
                          disabled={isProcessing}
                        >
                          <Undo2 className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      )}
                      
                      {/* Copy Action - Available for all statuses */}
                      <Button 
                        size="sm" 
                        className="hover:bg-gray-50 hover:text-gray-700"
                        onClick={() => handleCopy(draft.id)}
                        disabled={isProcessing}
                        title="Copy this draft"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      {/* Delete Action - Only for non-approved drafts */}
                      {draft.status !== "APPROVED" && (
                        <Button 
                          size="sm" 
                          className="hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(draft.id, draft.title)}
                          disabled={isProcessing}
                          title="Delete this draft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Secondary View Action */}
                      <Button variant="ghost" size="sm" asChild className=" hover:text-gray-500">
                        <Link href={`/advocate/drafts/${draft.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Summary */}
      {filteredDrafts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredDrafts.length} of {drafts.length} submissions
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={pullBackDialogOpen}
        onClose={() => !isProcessing && setPullBackDialogOpen(false)}
        onConfirm={confirmPullBack}
        title="Withdraw Draft to Edit"
        description="This will remove your draft from the review queue so you can make changes. You can edit and resubmit it later. Are you sure you want to continue?"
        confirmText={isProcessing ? "Withdrawing..." : "Withdraw to Edit"}
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}