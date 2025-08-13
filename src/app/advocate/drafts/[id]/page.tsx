"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { DraftStatus } from "@/lib/auth/roles";

type Draft = {
  id: string;
  title: string;
  type: string;
  status: DraftStatus;
  content: {
    description?: string;
    duration?: string;
    schedule?: string;
    outcomes?: string[];
    selectionCriteria?: string[];
    ageRange?: string;
    requirements?: string;
    contactInfo?: string;
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  organization?: {
    name: string;
  };
};

export default function DraftDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/drafts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDraft(data);
      } else if (response.status === 404) {
        router.push("/advocate/drafts");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
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
        return <Clock className="h-5 w-5" />;
      case DraftStatus.APPROVED:
        return <CheckCircle className="h-5 w-5" />;
      case DraftStatus.REJECTED:
        return <XCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
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
        <p className="text-muted-foreground mb-4">The course submission you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/advocate/drafts">Back to All Submissions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button className="hover:text-gray-500" variant="ghost" size="sm" asChild>
          <Link href="/advocate/drafts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Submissions
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
            Course submission details and status
          </p>
        </div>
        
        {(draft.status === DraftStatus.REJECTED || draft.status === DraftStatus.DRAFT) && (
          <Button asChild className="hover:bg-blue-700 hover:text-white">
            <Link href={`/advocate/submit?edit=${draft.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              {draft.status === DraftStatus.REJECTED ? "Revise Submission" : "Edit Draft"}
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
              <p className="font-medium">{new Date(draft.submittedAt).toLocaleDateString()}</p>
            </div>
            {draft.reviewedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="font-medium">{new Date(draft.reviewedAt).toLocaleDateString()}</p>
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
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Review Notes</h4>
              <p className="text-sm">{draft.reviewNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            The content of your submitted course draft
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {draft.content.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm leading-relaxed">{draft.content.description}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {draft.content.duration && (
              <div>
                <h4 className="font-medium mb-2">Duration</h4>
                <p className="text-sm">{draft.content.duration}</p>
              </div>
            )}
            {draft.content.schedule && (
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <p className="text-sm">{draft.content.schedule}</p>
              </div>
            )}
          </div>

          {draft.content.outcomes && draft.content.outcomes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Learning Outcomes</h4>
              <ul className="text-sm space-y-1">
                {draft.content.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {draft.content.selectionCriteria && draft.content.selectionCriteria.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Selection Criteria</h4>
              <ul className="text-sm space-y-1">
                {draft.content.selectionCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {draft.content.ageRange && (
              <div>
                <h4 className="font-medium mb-2">Target Age Range</h4>
                <p className="text-sm">{draft.content.ageRange}</p>
              </div>
            )}
            {draft.content.requirements && (
              <div>
                <h4 className="font-medium mb-2">Required Documents</h4>
                <p className="text-sm">{draft.content.requirements}</p>
              </div>
            )}
          </div>

          {draft.content.contactInfo && (
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{draft.content.contactInfo}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}