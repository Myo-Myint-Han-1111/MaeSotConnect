"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";

interface DraftContent {
  title?: string;
  description?: string;
  duration?: number;
  durationUnit?: string;
  schedule?: string;
  feeAmount?: number;
  ageMin?: number;
  ageMax?: number;
  outcomes?: string[];
  selectionCriteria?: string[];
  howToApply?: string[];
  startDate?: string;
  endDate?: string;
  applyByDate?: string;
  startByDate?: string;
  availableDays?: boolean[];
  badges?: Array<{
    text: string;
    color: string;
    backgroundColor: string;
  }>;
  imageUrls?: string[];
  faq?: Array<{
    question: string;
    questionMm?: string;
    answer: string;
    answerMm?: string;
  }>;
  outcomesMm?: string[];
  selectionCriteriaMm?: string[];
  howToApplyMm?: string[];
  document?: string;
  documentMm?: string;
  estimatedDate?: string;
  estimatedDateMm?: string;
  scheduleDetails?: string;
  scheduleDetailsMm?: string;
  descriptionMm?: string;
}

type Draft = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  content: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  organization?: {
    name: string;
  };
  reviewedByUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function OrgAdminDraftDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDraft = useCallback(async () => {
    try {
      const response = await fetch(`/api/drafts/${params.id}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setDraft(data);
      } else if (response.status === 404) {
        router.push("/org-admin/drafts");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchDraft();
    }
  }, [params.id, fetchDraft]);

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

  // Authentication and loading checks
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

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

  if (!draft) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Draft not found</h2>
        <p className="text-muted-foreground mb-4">The course draft you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/org-admin/drafts">Back to All Drafts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      {/* Back Button */}
      <div>
        <Button
          className="hover:text-gray-500"
          variant="ghost"
          size="sm"
          asChild
        >
          <Link href="/org-admin/drafts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Drafts
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
              {draft.status === DraftStatus.REJECTED
                ? "Needs Revision"
                : draft.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Course submission details and status
          </p>
        </div>

        {(draft.status === DraftStatus.REJECTED ||
          draft.status === DraftStatus.DRAFT) && (
          <Button asChild className="hover:bg-blue-700 hover:text-white">
            <Link href={`/org-admin/drafts/${draft.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {draft.status === DraftStatus.REJECTED
                ? "Revise Submission"
                : "Edit Draft"}
            </Link>
          </Button>
        )}
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {new Date(draft.submittedAt).toLocaleDateString()}
              </p>
            </div>
            {draft.reviewedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="font-medium">
                  {new Date(draft.reviewedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{draft.type.replace("_", " ")}</p>
            </div>
            {draft.organization && (
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-medium">{draft.organization.name}</p>
              </div>
            )}
          </div>

          {draft.reviewNotes && (
            <div className="mt-6">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-lg font-semibold text-blue-900">
                        Admin Review Feedback
                      </h4>
                      {draft.status === DraftStatus.REJECTED && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Action Required
                        </Badge>
                      )}
                    </div>

                    {draft.reviewedByUser && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-blue-700">
                        <User className="h-4 w-4" />
                        <span>Reviewed by {draft.reviewedByUser.name}</span>
                        <span className="text-blue-600">•</span>
                        <span>
                          {draft.reviewedByUser.role.replace("_", " ")}
                        </span>
                        {draft.reviewedAt && (
                          <>
                            <span className="text-blue-600">•</span>
                            <span>
                              {new Date(draft.reviewedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {draft.reviewNotes}
                      </p>
                    </div>

                    {draft.status === DraftStatus.REJECTED && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Next Steps:</strong> Please review the feedback above and revise your submission using the &quot;Revise Submission&quot; button.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Preview of your submitted course draft
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {draft.content.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm leading-relaxed">
                {draft.content.description}
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {draft.content.duration && (
              <div>
                <h4 className="font-medium mb-2">Duration</h4>
                <p className="text-sm">{draft.content.duration} days</p>
              </div>
            )}
            {draft.content.schedule && (
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <p className="text-sm">{draft.content.schedule}</p>
              </div>
            )}
            {draft.content.feeAmount !== undefined && (
              <div>
                <h4 className="font-medium mb-2">Fee</h4>
                <p className="text-sm">
                  {draft.content.feeAmount === 0
                    ? "Free"
                    : `${draft.content.feeAmount} THB`}
                </p>
              </div>
            )}
            {(draft.content.ageMin || draft.content.ageMax) && (
              <div>
                <h4 className="font-medium mb-2">Age Range</h4>
                <p className="text-sm">
                  {draft.content.ageMin && draft.content.ageMax
                    ? `${draft.content.ageMin} - ${draft.content.ageMax} years`
                    : draft.content.ageMin
                    ? `${draft.content.ageMin}+ years`
                    : draft.content.ageMax
                    ? `Up to ${draft.content.ageMax} years`
                    : "No age restrictions"}
                </p>
              </div>
            )}
          </div>

          {draft.content.outcomes && draft.content.outcomes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Learning Outcomes</h4>
              <ul className="text-sm space-y-1">
                {draft.content.outcomes
                  .filter((outcome: string) => outcome.trim())
                  .map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {draft.content.selectionCriteria &&
            draft.content.selectionCriteria.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Selection Criteria</h4>
                <ul className="text-sm space-y-1">
                  {draft.content.selectionCriteria
                    .filter((criteria: string) => criteria.trim())
                    .map((criteria: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {draft.content.howToApply && draft.content.howToApply.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">How to Apply</h4>
              <ol className="text-sm space-y-1">
                {draft.content.howToApply
                  .filter((step: string) => step.trim())
                  .map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
