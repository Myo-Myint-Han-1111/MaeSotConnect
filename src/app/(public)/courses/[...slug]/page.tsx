"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";

import CourseDetailComponent from "@/components/CourseDetail/CourseDetailComponent";

interface CourseDetail {
  id: string;
  title: string;
  titleMm?: string;
  subtitle: string;
  subtitleMm?: string;
  location: string;
  locationMm?: string;
  province?: string;
  district?: string;
  startDate: string;
  startDateMm?: string;
  endDate: string;
  endDateMm?: string;
  duration: number;
  durationMm?: number;
  schedule: string;
  scheduleMm?: string;
  feeAmount?: number;
  feeAmountMm?: number;
  ageMin?: number;
  ageMinMm?: number;
  ageMax?: number;
  ageMaxMm?: number;
  document?: string;
  documentMm?: string;
  availableDays: boolean[];
  description?: string;
  descriptionMm?: string;
  outcomes?: string[];
  outcomesMm?: string[];
  scheduleDetails?: string;
  scheduleDetailsMm?: string;
  selectionCriteria?: string[];
  selectionCriteriaMm?: string[];
  howToApply?: string[];
  howToApplyMm?: string[];
  applyButtonText?: string;
  applyButtonTextMm?: string;
  applyLink?: string;
  badges: {
    text: string;
    color: string;
    backgroundColor: string;
  }[];
  images: string[];
  faq?: {
    question: string;
    questionMm?: string;
    answer: string;
    answerMm?: string;
  }[];
  organizationInfo?: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebookPage?: string;
    district?: string;
    province?: string;
    latitude: number;
    longitude: number;
    logoImage?: string;
  };
}

export default function CourseSlugPage() {
  const params = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        // Handle slug format
        const slug = Array.isArray(params.slug)
          ? params.slug.join("/")
          : params.slug;

        if (!slug) {
          notFound();
          return;
        }

        // Fetch course using the slug directly
        const response = await fetch(
          `/api/courses/${encodeURIComponent(slug)}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
            return;
          }
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
    }

    fetchCourse();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="content py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    notFound();
  }

  // Pass the fetched course data directly to the component
  return <CourseDetailComponent course={course} />;
}
