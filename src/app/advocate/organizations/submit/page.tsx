"use client";

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdvocateOrganizationForm from "@/components/forms/AdvocateOrganizationForm";

interface DraftData {
  id: string;
  title: string;
  type: string;
  content: Record<string, unknown>;
  status: string;
}

export default function SubmitOrganizationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDraftData = useCallback(async () => {
    if (!editId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${editId}`);
      if (response.ok) {
        const draft = await response.json();
        if (draft.type !== "ORGANIZATION") {
          setError("This draft is not an organization draft.");
          return;
        }
        setDraftData(draft);
      } else if (response.status === 404) {
        setError("Draft not found.");
      } else {
        setError("Failed to load draft data.");
      }
    } catch (err) {
      console.error("Error fetching draft:", err);
      setError("Failed to load draft data.");
    } finally {
      setLoading(false);
    }
  }, [editId]);

  useEffect(() => {
    if (editId && session?.user?.role === "YOUTH_ADVOCATE") {
      fetchDraftData();
    }
  }, [editId, session, fetchDraftData]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH_ADVOCATE") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a youth advocate to submit organization drafts.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <AdvocateOrganizationForm 
        initialData={draftData?.content as Record<string, unknown>}
        mode={editId ? "edit" : "create"}
        editDraftId={editId || undefined}
      />
    </div>
  );
}