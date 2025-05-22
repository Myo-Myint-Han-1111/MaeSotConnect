"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, redirect } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

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
  // API returns DateTime as ISO strings
  startDate: string;
  startDateMm?: string | null;
  endDate: string; // New field
  endDateMm?: string | null; // New field
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
  location: string; // Derived from organizationInfo.address
  locationMm: string;
  startDate: string; // ISO date string for HTML date input
  startDateMm: string;
  endDate: string; // New field
  endDateMm: string; // New field
  duration: number; // Number for new schema
  durationMm: number; // Number for new schema
  schedule: string;
  scheduleMm: string;
  feeAmount: number; // New field
  feeAmountMm: number; // New field
  ageMin: number; // New field
  ageMinMm: number; // New field
  ageMax: number; // New field
  ageMaxMm: number; // New field
  document: string; // New field
  documentMm: string; // New field
  availableDays: boolean[];
  description: string;
  descriptionMm: string;
  outcomes: string[];
  outcomesMm: string[];
  scheduleDetails: string;
  scheduleDetailsMm: string;
  selectionCriteria: string[];
  selectionCriteriaMm: string[];
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
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data: CourseResponse = await response.json();

        // Store existing images separately
        setExistingImages(data.images || []);

        // Process the data to match CourseFormData structure
        const processedData: Partial<CourseFormData> = {
          id: data.id,
          title: data.title || "",
          titleMm: data.titleMm ?? "",
          subtitle: data.subtitle || "",
          subtitleMm: data.subtitleMm ?? "",

          // Map organization address to location for backward compatibility
          location: data.organizationInfo?.address || "",
          locationMm: data.organizationInfo?.address || "", // You might want to add a locationMm field to organization

          // Format dates for HTML date inputs (YYYY-MM-DD format)
          startDate: formatDateForInput(data.startDate),
          startDateMm: data.startDateMm
            ? formatDateForInput(data.startDateMm)
            : "",
          endDate: formatDateForInput(data.endDate), // New field
          endDateMm: data.endDateMm ? formatDateForInput(data.endDateMm) : "", // New field

          // Duration as numbers
          duration: data.duration || 0,
          durationMm: data.durationMm ?? 0,

          schedule: data.schedule || "",
          scheduleMm: data.scheduleMm ?? "",

          // New fee amount fields
          feeAmount: data.feeAmount || 0,
          feeAmountMm: data.feeAmountMm ?? 0,

          // New age fields
          ageMin: data.ageMin || 0,
          ageMinMm: data.ageMinMm ?? 0,
          ageMax: data.ageMax || 0,
          ageMaxMm: data.ageMaxMm ?? 0,

          // New document fields
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

  // Check if user has permission to edit this course
  if (
    course?.organizationId &&
    session?.user?.role !== "PLATFORM_ADMIN" &&
    course.organizationId !== session?.user?.organizationId
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
      <h1 className="text-2xl font-bold mb-6">Edit Course: {course.title}</h1>
      <CourseForm
        mode="edit"
        initialData={course}
        existingImages={existingImages}
      />
    </div>
  );
}
