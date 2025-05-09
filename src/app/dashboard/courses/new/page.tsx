// src/app/dashboard/courses/new/page.tsx, modify to handle organizationId:

"use client";

import React, { useEffect, useState } from "react";
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

  // Determine if the user has permission to create a course for this organization
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // Check if the user can create a course for this organization
    if (session && organizationId) {
      const isPlatformAdmin = session.user.role === "PLATFORM_ADMIN";
      const isOrgAdmin =
        session.user.role === "ORGANIZATION_ADMIN" &&
        session.user.organizationId === organizationId;

      setHasPermission(isPlatformAdmin || isOrgAdmin);
    }
  }, [session, organizationId]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Ensure the user can create courses
  if (
    !session?.user?.organizationId &&
    session?.user?.role !== "PLATFORM_ADMIN"
  ) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You must be associated with an organization to create courses.
        </p>
      </div>
    );
  }

  // Check if user has permission to create for this organization
  if (organizationId && !hasPermission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to create courses for this organization.
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
