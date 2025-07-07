"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");
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

  // Only platform admins can create courses
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be a platform administrator to create courses.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      <CourseForm mode="create" organizationId={organizationId || undefined} />
    </div>
  );
}
