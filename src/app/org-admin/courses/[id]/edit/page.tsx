"use client";

// app/org-admin/courses/[id]/edit/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import OrganizationAdminCourseForm from "@/components/forms/OrganizationAdminCourseForm";

interface Course {
  id: string;
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  description?: string;
  descriptionMm?: string;
  startDate: string;
  endDate: string;
  applyByDate?: string | null;
  startByDate?: string | null;
  duration: number;
  durationUnit?: string;
  durationUnitMm?: string;
  estimatedDate?: string | null;
  schedule: string;
  scheduleMm?: string;
  feeAmount: number;
  province?: string;
  district?: string;
  address?: string;
  organizationId: string;
  images: string[];
  badges: Array<{
    text: string;
    color: string;
    backgroundColor: string;
  }>;
  organizationInfo?: {
    name: string;
    slug?: string;
  };
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export default function EditCoursePage() {
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

  const { data: session, status } = useSession();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setError("You must be logged in to edit courses");
      setLoading(false);
      return;
    }

    fetchCourse();
  }, [courseId, session, status, fetchCourse]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground">
          The course you are looking for could not be found.
        </p>
      </div>
    );
  }

  // Check if user has permission to edit this course
  const user = session?.user as SessionUser;
  if (
    course.organizationId &&
    user?.role !== "PLATFORM_ADMIN" &&
    course.organizationId !== user?.organizationId
  ) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to edit this course.
        </p>
      </div>
    );
  }

  // Convert course data to form data format
  const courseFormData = {
    ...course,
    images: [],
    startDate: formatDateForInput(course.startDate),
    endDate: formatDateForInput(course.endDate),
    applyByDate: formatDateForInput(course.applyByDate || null),
    startByDate: formatDateForInput(course.startByDate || null),
    estimatedDate: course.estimatedDate || "",
  };

  // Fixed: Handle images properly - API returns string[], form expects string[]
  const existingImageUrls = Array.isArray(course.images)
    ? course.images.filter((img) => typeof img === "string" && img.length > 0)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-gray-600 mt-1">
          Edit your course details. Changes will be submitted for review by
          platform admin.
        </p>
      </div>

      <OrganizationAdminCourseForm
        mode="edit"
        initialData={courseFormData}
        existingImages={existingImageUrls}
        // organizationId={course.organizationId}
        draftMode={true}
        backUrl="/org-admin/courses"
      />
    </div>
  );
}
