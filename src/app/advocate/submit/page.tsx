"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

export default function SubmitCoursePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  if (status === "loading") {
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
          You must be a youth advocate to submit course proposals.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CourseForm
        mode="create"
        draftMode={true}
        backUrl="/advocate"
      />
    </div>
  );
}