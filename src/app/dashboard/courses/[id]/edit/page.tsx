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

// Define the expected structure of courses from the API
interface CourseResponse {
  id: string;
  title: string;
  titleMm?: string | null;
  subtitle: string;
  subtitleMm?: string | null;
  location: string;
  locationMm?: string | null;
  startDate: string;
  startDateMm?: string | null;
  duration: string;
  durationMm?: string | null;
  schedule: string;
  scheduleMm?: string | null;
  fee?: string | null;
  feeMm?: string | null;
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

// Define the structure for CourseFormData
interface CourseFormData {
  id?: string;
  title: string;
  titleMm: string;
  subtitle: string;
  subtitleMm: string;
  location: string;
  locationMm: string;
  startDate: string;
  startDateMm: string;
  duration: string;
  durationMm: string;
  schedule: string;
  scheduleMm: string;
  fee: string;
  feeMm: string;
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

        // Process the data to ensure no null values
        const processedData: Partial<CourseFormData> = {
          id: data.id,
          title: data.title || "",
          titleMm: data.titleMm ?? "",
          subtitle: data.subtitle || "",
          subtitleMm: data.subtitleMm ?? "",
          location: data.location || "",
          locationMm: data.locationMm ?? "",
          startDate: data.startDate || "",
          startDateMm: data.startDateMm ?? "",
          duration: data.duration || "",
          durationMm: data.durationMm ?? "",
          schedule: data.schedule || "",
          scheduleMm: data.scheduleMm ?? "",
          fee: data.fee ?? "",
          feeMm: data.feeMm ?? "",
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
