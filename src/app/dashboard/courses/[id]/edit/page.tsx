"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, redirect } from "next/navigation";
import PlatformAdminCourseForm from "@/components/forms/PlatformAdminCourseForm";

// Type assertion for session user with organizationId
interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

// Define interface for organization info
interface OrganizationInfo {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  facebookPage?: string | null;
  latitude: number;
  longitude: number;
  district?: string;
  province?: string;
  mapLocation?: {
    lat: number;
    lng: number;
  };
}

// Define interfaces for the FAQ structure
interface FAQ {
  id?: string;
  question: string;
  questionMm?: string | null;
  answer: string;
  answerMm?: string | null;
  courseId?: string;
}

// Define the expected structure of courses from the API (Updated)
interface CourseResponse {
  id: string;
  title: string;
  titleMm?: string | null;
  subtitle: string;
  subtitleMm?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;

  // API returns DateTime as ISO strings
  startDate: string;
  startDateMm?: string | null;
  endDate: string;
  endDateMm?: string | null;
  // API returns numbers for duration
  duration: number;
  durationMm?: number | null;
  schedule: string;
  scheduleMm?: string | null;
  // API returns numbers for fee amounts
  feeAmount: number;
  feeAmountMm?: number | null;
  // New age fields
  ageMin: number;
  ageMinMm?: number | null;
  ageMax: number;
  ageMaxMm?: number | null;
  // New document fields
  document: string;
  documentMm?: string | null;
  availableDays: boolean[];
  description?: string | null;
  descriptionMm?: string | null;
  outcomes: string[];
  outcomesMm?: string[] | null;
  scheduleDetails?: string | null;
  scheduleDetailsMm?: string | null;
  selectionCriteria: string[];
  selectionCriteriaMm?: string[] | null;
  howToApply?: string[] | null;
  howToApplyMm?: string[] | null;
  applyButtonText?: string | null;
  applyButtonTextMm?: string | null;
  applyLink?: string | null;
  organizationId: string;
  images: string[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  faq?: FAQ[];
  organizationInfo?: OrganizationInfo | null;
}

// Define the structure for CourseFormData (Updated to match CourseForm expectations)
interface CourseFormData {
  id?: string;
  title: string;
  titleMm: string;
  subtitle: string;
  subtitleMm: string;
  province: string;
  district: string;
  address: string;
  applyByDate: string;
  applyByDateMm: string;
  estimatedDate: string;
  estimatedDateMm: string;

  location: string; // Derived from organizationInfo.address
  locationMm: string;
  startDate: string; // ISO date string for HTML date input
  startDateMm: string;
  endDate: string;
  endDateMm: string;
  duration: number | null; // Number for new schema
  durationMm: number; // Number for new schema
  schedule: string;
  scheduleMm: string;
  feeAmount: number;
  feeAmountMm: number;
  ageMin?: number | null;
  ageMax?: number | null;
  ageMinMm?: number | null;
  ageMaxMm?: number | null;
  document: string;
  documentMm: string;
  availableDays: boolean[];
  description: string;
  descriptionMm: string;
  outcomes: string[];
  outcomesMm: string[];
  scheduleDetails: string;
  scheduleDetailsMm: string;
  selectionCriteria: string[];
  selectionCriteriaMm: string[];
  howToApply: string[];
  howToApplyMm: string[];
  applyButtonText?: string;
  applyButtonTextMm?: string;
  applyLink?: string;
  organizationId?: string;
  images: File[];
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  faq: {
    question: string;
    questionMm: string;
    answer: string;
    answerMm: string;
  }[];
}

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export default function EditCoursePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Partial<CourseFormData> | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${id}`, {
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data: CourseResponse = await response.json();

        // DEBUG: Log the API response to see what we're getting
        console.log("=== EditCoursePage: API Response ===");
        console.log("Full response:", data);
        console.log("Province:", data.province);
        console.log("District:", data.district);
        console.log("EstimatedDate (raw from API):", data.estimatedDate);
        console.log("EstimatedDateMm (raw from API):", data.estimatedDateMm);

        // Store existing images separately
        setExistingImages(data.images || []);

        // Process the data to match CourseFormData structure
        const processedData: Partial<CourseFormData> = {
          id: data.id,
          title: data.title || "",
          titleMm: data.titleMm ?? "",
          subtitle: data.subtitle || "",
          subtitleMm: data.subtitleMm ?? "",

          // Use direct province and district fields from Course model
          province: data.province ?? "",
          district: data.district ?? "",
          address: data.address ?? "",
          applyByDate: data.applyByDate
            ? formatDateForInput(data.applyByDate)
            : "",
          applyByDateMm: data.applyByDateMm
            ? formatDateForInput(data.applyByDateMm)
            : "",
          // Pass the encoded estimated date directly to CourseForm
          // CourseForm will handle the decoding
          estimatedDate: data.estimatedDate ?? "",
          estimatedDateMm: data.estimatedDateMm ?? "",

          // Format dates for HTML date inputs (YYYY-MM-DD format)
          startDate: formatDateForInput(data.startDate),
          endDate: formatDateForInput(data.endDate),

          // Duration as numbers
          duration: data.duration || 0,

          schedule: data.schedule || "",
          scheduleMm: data.scheduleMm ?? "",

          // Fee amount fields
          feeAmount: data.feeAmount ?? -1, // Use -1 as default if no feeAmount exists

          // Age fields
          ageMin: data.ageMin && data.ageMin > 0 ? data.ageMin : null,
          ageMax: data.ageMax && data.ageMax > 0 ? data.ageMax : null,

          // Document fields
          document: data.document || "",
          documentMm: data.documentMm ?? "",

          availableDays: data.availableDays || [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
          ],
          description: data.description ?? "",
          descriptionMm: data.descriptionMm ?? "",
          outcomes: data.outcomes || [""],
          outcomesMm: data.outcomesMm ?? [""],
          scheduleDetails: data.scheduleDetails ?? "",
          scheduleDetailsMm: data.scheduleDetailsMm ?? "",
          selectionCriteria: data.selectionCriteria || [""],
          selectionCriteriaMm: data.selectionCriteriaMm ?? [""],
          howToApply: data.howToApply || [""],
          howToApplyMm: data.howToApplyMm ?? [""],
          applyButtonText: data.applyButtonText || "",
          applyButtonTextMm: data.applyButtonTextMm || "",
          applyLink: data.applyLink || "",
          organizationId: data.organizationId,
          badges: data.badges || [],
          images: [], // New images will be added here, existing ones are stored separately

          // Process FAQ fields to ensure all required fields exist
          faq: (data.faq || []).map((item: FAQ) => ({
            question: item.question || "",
            questionMm: item.questionMm ?? "",
            answer: item.answer || "",
            answerMm: item.answerMm ?? "",
          })),
        };

        // If there are no FAQs, provide a default empty one
        if (!processedData.faq?.length) {
          processedData.faq = [
            {
              question: "",
              questionMm: "",
              answer: "",
              answerMm: "",
            },
          ];
        }

        console.log("Processed course data for form:", processedData);
        console.log("Province being set:", processedData.province);
        console.log("District being set:", processedData.district);
        console.log("EstimatedDate being passed:", processedData.estimatedDate);
        console.log(
          "EstimatedDateMm being passed:",
          processedData.estimatedDateMm
        );

        setCourse(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Type assertion to access organizationId
  const user = session?.user as SessionUser;

  // Check if user has permission to edit this course
  if (
    course?.organizationId &&
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

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error || "Course not found"}</p>
      </div>
    );
  }

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">Edit Course: {course.title}</h1> */}
      <PlatformAdminCourseForm
        mode="edit"
        initialData={course}
        existingImages={existingImages}
      />
    </div>
  );
}
