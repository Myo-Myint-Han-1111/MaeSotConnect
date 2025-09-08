"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import OrganizationAdminCourseForm from "@/components/forms/OrganizationAdminCourseForm";

interface Draft {
  id: string;
  title: string;
  type: string;
  content: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  status: string;
}

export default function DraftEditPage() {
  const formatDateForInput = (dateStr: string | null): string => {
    if (!dateStr) return "";
    try {
      // Handle both ISO strings and date strings
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const params = useParams();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

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
      router.push("/org-admin/drafts");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchDraft();
    }
  }, [params.id, fetchDraft]);

  // Transform draft content to proper form data format - same pattern as working edit page
  const draftFormData = draft
    ? {
        ...draft.content,
        images: [],
        startDate: formatDateForInput(draft.content.startDate || null),
        endDate: formatDateForInput(draft.content.endDate || null),
        applyByDate: formatDateForInput(draft.content.applyByDate || null),
        startByDate: formatDateForInput(draft.content.startByDate || null),
        // ENSURE MISSING FIELDS HAVE DEFAULTS
        availableDays: draft.content.availableDays || [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        badges: draft.content.badges || [],
        imageUrls: draft.content.imageUrls || [],
        faq: draft.content.faq?.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          question: item.question,
          questionMm: item.questionMm || "",
          answer: item.answer,
          answerMm: item.answerMm || "",
        })) || [{ question: "", questionMm: "", answer: "", answerMm: "" }],
        outcomes: draft.content.outcomes || [""],
        outcomesMm: draft.content.outcomesMm || [""],
        selectionCriteria: draft.content.selectionCriteria || [""],
        selectionCriteriaMm: draft.content.selectionCriteriaMm || [""],
        howToApply: draft.content.howToApply || [""],
        howToApplyMm: draft.content.howToApplyMm || [""],
        document: draft.content.document || "",
        documentMm: draft.content.documentMm || "",
        estimatedDate: draft.content.estimatedDate || "",
        scheduleDetails: draft.content.scheduleDetails || "",
        scheduleDetailsMm: draft.content.scheduleDetailsMm || "",
        description: draft.content.description || "",
        descriptionMm: draft.content.descriptionMm || "",
      }
    : null;

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

  if (!draft || !draftFormData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Draft not found</h2>
        <p className="text-muted-foreground mb-4">The course draft you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  // Extract existing images from draft content
  const existingImageUrls = Array.isArray(draft.content.imageUrls)
    ? draft.content.imageUrls.filter(
        (url: any) => typeof url === "string" && url.length > 0 // eslint-disable-line @typescript-eslint/no-explicit-any
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizationAdminCourseForm
        initialData={draftFormData}
        mode="edit"
        draftMode={true}
        backUrl="/org-admin/drafts"
        editDraftId={draft.id}
        submitButtonText="Update Draft"
        existingImages={existingImageUrls} // ← ADD THIS LINE
      />
    </div>
  );
}
