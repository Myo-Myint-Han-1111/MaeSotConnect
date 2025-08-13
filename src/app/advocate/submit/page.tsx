"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

type DraftData = {
  id: string;
  title: string;
  type: string;
  status: string;
  content: {
    imageUrls?: string[];
    [key: string]: unknown;
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  organization?: {
    name: string;
  };
} | null;

export default function SubmitCoursePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const searchParams = useSearchParams();
  const editDraftId = searchParams.get("edit");
  const [draftData, setDraftData] = useState<DraftData>(null);
  const [loading, setLoading] = useState(!!editDraftId);

  const fetchDraftData = useCallback(async () => {
    try {
      const response = await fetch(`/api/drafts/${editDraftId}`);
      if (response.ok) {
        const draft = await response.json();
        setDraftData(draft);
      } else {
        console.error("Failed to fetch draft data");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
    } finally {
      setLoading(false);
    }
  }, [editDraftId]);

  useEffect(() => {
    if (editDraftId) {
      fetchDraftData();
    }
  }, [editDraftId, fetchDraftData]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only youth advocates can access this page
  if (session?.user?.role !== "YOUTH_ADVOCATE") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a youth advocate to submit course drafts.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CourseForm
        mode={editDraftId ? "edit" : "create"}
        draftMode={true}
        backUrl="/advocate"
        initialData={draftData?.content as Partial<Record<string, unknown>> || undefined}
        existingImages={Array.isArray(draftData?.content?.imageUrls) ? draftData.content.imageUrls : []}
        editDraftId={editDraftId || undefined}
      />
    </div>
  );
}