"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, User, Edit, X } from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import PlatformAdminCourseForm from "@/components/forms/PlatformAdminCourseForm";
import YouthAdvocateCourseForm from "@/components/forms/YouthAdvocateCourseForm";


type Draft = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  content: Record<string, unknown>; // The full course data
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  author: {
    name: string;
    email: string;
  };
  organization?: {
    name: string;
  };
};

export default function AdminDraftReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, unknown> | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/admin/drafts/${params.id}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setDraft(data);
        setReviewNotes(data.reviewNotes || "");
      } else if (response.status === 404) {
        router.push("/admin/drafts");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!draft) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/drafts/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "APPROVED",
          reviewNotes: reviewNotes.trim(),
          content: editedContent || draft.content, // Use edited content if available
        }),
      });

      if (response.ok) {
        router.push("/admin/drafts?approved=true");
      } else {
        const error = await response.json();
        alert(`Error approving draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error approving draft:", error);
      alert("Error approving draft. Please try again.");
    } finally {
      setIsProcessing(false);
      setApproveDialogOpen(false);
    }
  };

  const handleReject = async () => {
    if (!draft) return;
    
    if (!reviewNotes.trim()) {
      alert("Please provide review notes explaining why this draft is being rejected.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/drafts/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
          reviewNotes: reviewNotes.trim(),
          content: editedContent || draft.content, // Use edited content if available
        }),
      });

      if (response.ok) {
        router.push("/admin/drafts?rejected=true");
      } else {
        const error = await response.json();
        alert(`Error rejecting draft: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error rejecting draft:", error);
      alert("Error rejecting draft. Please try again.");
    } finally {
      setIsProcessing(false);
      setRejectDialogOpen(false);
    }
  };


  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedContent(null);
  };

  // Helper function to convert dates to YYYY-MM-DD format for form inputs
  const formatDateForInput = (dateValue: unknown): string => {
    if (!dateValue) return "";
    
    let date: Date;
    if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "";
    }
    
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  };

  // Prepare initial data with properly formatted dates
  const prepareInitialData = (content: Record<string, unknown>) => {
    return {
      ...content,
      startDate: formatDateForInput(content.startDate),
      endDate: formatDateForInput(content.endDate),
      applyByDate: formatDateForInput(content.applyByDate),
      applyByDateMm: formatDateForInput(content.applyByDateMm),
    };
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setEditedContent(formData);
    
    // Save the changes
    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/admin/drafts/${draft!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: formData,
        }),
      });

      if (response.ok) {
        // Update the local draft state with the edited content
        setDraft(prev => prev ? { ...prev, content: formData } : null);
        setIsEditMode(false);
        setEditedContent(null);
      } else {
        const error = await response.json();
        alert(`Error saving changes: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error saving changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
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
        return <Clock className="h-5 w-5" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="h-5 w-5" />;
      case DraftStatus.REJECTED:
        return <XCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderContentField = (label: string, value: unknown, isList = false) => {
    if (!value) return null;
    
    if (isList && Array.isArray(value)) {
      if (value.length === 0) return null;
      return (
        <div className="mb-4">
          <h4 className="font-medium mb-2">{label}</h4>
          <ul className="text-sm space-y-1">
            {value.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="font-medium mb-2">{label}</h4>
        <p className="text-sm leading-relaxed">{String(value)}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Draft not found</h2>
        <p className="text-muted-foreground mb-4">The course draft you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/admin/drafts">Back to Draft Reviews</Link>
        </Button>
      </div>
    );
  }

  const isPending = draft.status === DraftStatus.PENDING;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="hover:text-gray-500">
          <Link href="/admin/drafts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Draft Reviews
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(draft.status)}
            <h1 className="text-3xl font-bold tracking-tight">{draft.title}</h1>
            <Badge className={getStatusBadgeColor(draft.status)}>
              {draft.status === DraftStatus.REJECTED ? "Needs Revision" : draft.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Course draft review and approval
          </p>
        </div>
        
        {/* Edit Mode Toggle */}
        {isPending && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isSavingEdit}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditMode(true)}
                disabled={isProcessing}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Draft
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Submitted By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <p className="font-medium">{draft.author.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{draft.author.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(draft.submittedAt).toLocaleDateString()}</p>
                </div>
                {draft.organization && (
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium">{draft.organization.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          {isEditMode ? (
            <div>
              {draft.type === "YOUTH_ADVOCATE" ? (
                <YouthAdvocateCourseForm
                  initialData={prepareInitialData(editedContent || draft.content)}
                  mode="edit"
                  onSubmit={handleFormSubmit as never}
                  isSubmitting={isSavingEdit}
                  submitButtonText="Save Changes"
                  draftMode={true}
                />
              ) : (
                <PlatformAdminCourseForm
                  initialData={prepareInitialData(editedContent || draft.content)}
                  mode="edit"
                  onSubmit={handleFormSubmit as never}
                  isSubmitting={isSavingEdit}
                  submitButtonText="Save Changes"
                />
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Course Draft Details</CardTitle>
                <CardDescription>
                  Complete information about the proposed course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Basic Information */}
              {renderContentField("Course Title", draft.content.title)}
              {renderContentField("Subtitle", draft.content.subtitle)}
              {renderContentField("Description", draft.content.description)}
              
              {/* Schedule and Duration */}
              <div className="grid gap-6 md:grid-cols-2">
                {renderContentField("Schedule", draft.content.schedule)}
                {renderContentField("Duration", `${draft.content.duration} days`)}
              </div>

              {/* Dates */}
              <div className="grid gap-6 md:grid-cols-2">
                {renderContentField("Start Date", draft.content.startDate ? new Date(draft.content.startDate as string).toLocaleDateString() : null)}
                {renderContentField("End Date", draft.content.endDate ? new Date(draft.content.endDate as string).toLocaleDateString() : null)}
              </div>

              {/* Location */}
              <div className="grid gap-6 md:grid-cols-2">
                {renderContentField("Province", draft.content.province)}
                {renderContentField("District", draft.content.district)}
              </div>
              {renderContentField("Address", draft.content.address)}

              {/* Lists */}
              {renderContentField("Learning Outcomes", draft.content.outcomes, true)}
              {renderContentField("Selection Criteria", draft.content.selectionCriteria, true)}
              {renderContentField("How to Apply", draft.content.howToApply, true)}

              {/* Age and Requirements */}
              <div className="grid gap-6 md:grid-cols-2">
                {renderContentField("Age Range", 
                  (draft.content.ageMin && draft.content.ageMax) 
                    ? `${draft.content.ageMin} - ${draft.content.ageMax} years`
                    : draft.content.ageMin 
                      ? `Minimum ${draft.content.ageMin} years`
                      : draft.content.ageMax 
                        ? `Maximum ${draft.content.ageMax} years`
                        : null
                )}
                {renderContentField("Fee Amount", typeof draft.content.feeAmount === 'number' && draft.content.feeAmount >= 0 ? `${draft.content.feeAmount} THB` : "Not specified")}
              </div>

              {renderContentField("Required Documents", draft.content.document)}

              {/* Course Images */}
              {Array.isArray(draft.content.imageUrls) && draft.content.imageUrls.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-3">Course Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(draft.content.imageUrls as string[]).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative h-32 border rounded-md overflow-hidden bg-gray-50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={`Course image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            // Open image in new tab for full view
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }}
                        />
                        <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tr-md">
                          {index + 1} of {(draft.content.imageUrls as string[]).length}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click on any image to view it in full size
                  </p>
                </div>
              )}

              {/* Badges */}
              {Array.isArray(draft.content.badges) && draft.content.badges.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Course Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {(draft.content.badges as Array<{text: string; backgroundColor: string; color: string}>).map((badge, index: number) => (
                      <Badge 
                        key={index} 
                        style={{ 
                          backgroundColor: badge.backgroundColor, 
                          color: badge.color 
                        }}
                      >
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {Array.isArray(draft.content.faq) && draft.content.faq.length > 0 && (draft.content.faq as Array<{question: string; answer: string}>).some((f) => f.question) && (
                <div>
                  <h4 className="font-medium mb-4">Frequently Asked Questions</h4>
                  <div className="space-y-4">
                    {(draft.content.faq as Array<{question: string; answer: string}>).map((faq, index: number) => 
                      faq.question && (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <h5 className="font-medium text-sm">{faq.question}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Review Actions */}
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
                <CardDescription>
                  Approve or reject this course draft
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your review decision..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for rejections, optional for approvals
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Create Course
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full hover:bg-red-700 transition-colors hover:text-white"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Status */}
          <Card>
            <CardHeader>
              <CardTitle>Review Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(draft.status)}
                  <span className="font-medium">{draft.status}</span>
                  <Badge className={getStatusBadgeColor(draft.status)}>
                    {draft.status === DraftStatus.REJECTED ? "Needs Revision" : draft.status}
                  </Badge>
                </div>
                
                {draft.reviewedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed on</p>
                    <p className="font-medium">{new Date(draft.reviewedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {draft.reviewNotes && !isPending && (
                  <div>
                    <p className="text-sm text-muted-foreground">Review Notes</p>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm">{draft.reviewNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="Approve Course Draft"
        description="This will approve the course draft and create a published course. The author will be notified of the approval."
        confirmText="Approve & Create Course"
        cancelText="Cancel"
        variant="default"
      />

      <ConfirmationDialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Reject Course Draft"
        description="This will reject the course draft and notify the author. Make sure you have provided clear feedback in the review notes."
        confirmText="Reject Draft"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}