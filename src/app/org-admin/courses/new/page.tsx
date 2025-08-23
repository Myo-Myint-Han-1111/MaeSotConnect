"use client";

// app/org-admin/courses/new/page.tsx
import OrganizationAdminCourseForm from "@/components/forms/OrganizationAdminCourseForm";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600 mt-1">
          Create a new course for your organization. It will be submitted for
          review.
        </p>
      </div>

      <OrganizationAdminCourseForm
        mode="create"
        draftMode={true}
        backUrl="/org-admin/courses"
      />
    </div>
  );
}
