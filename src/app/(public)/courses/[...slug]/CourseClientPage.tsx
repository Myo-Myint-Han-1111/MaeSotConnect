"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { DurationUnit } from "@/types";
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
  endDate: string;
  duration: number;
  durationUnit: DurationUnit;
  durationUnitMm?: DurationUnit;
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
  createdAt?: string;
  createdByUser?: {
    id: string;
    name: string;
    image: string | null;
    role: string;
    advocateProfile?: {
      publicName: string | null;
      avatarUrl: string | null;
      status: string;
    } | null;
  } | null;
}

// Cache management constants
const COURSE_DETAILS_CACHE_KEY = "courseDetailsCache";
const COURSE_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CachedCourseDetails {
  [slug: string]: {
    course: CourseDetail;
    timestamp: number;
  };
}

export default function CourseSlugPage() {
  const params = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRequestedRef = useRef(false);

  // Get the current slug
  const currentSlug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : params.slug;

  // Cache management functions
  const saveCourseToCache = useCallback(
    (slug: string, courseData: CourseDetail) => {
      if (typeof window === "undefined") return;

      try {
        const cached = JSON.parse(
          sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY) || "{}"
        ) as CachedCourseDetails;
        cached[slug] = {
          course: courseData,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(
          COURSE_DETAILS_CACHE_KEY,
          JSON.stringify(cached)
        );
      } catch (error) {
        console.error("Error saving course to cache:", error);
      }
    },
    []
  );

  const restoreCourseFromCache = useCallback(
    (slug: string): CourseDetail | null => {
      if (typeof window === "undefined") return null;

      try {
        const cached = JSON.parse(
          sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY) || "{}"
        ) as CachedCourseDetails;
        const courseCache = cached[slug];

        if (!courseCache) {
          return null;
        }

        // Check if cache is still valid
        if (
          Date.now() - courseCache.timestamp >
          COURSE_DETAILS_CACHE_DURATION
        ) {
          delete cached[slug];
          sessionStorage.setItem(
            COURSE_DETAILS_CACHE_KEY,
            JSON.stringify(cached)
          );
          return null;
        }

        return courseCache.course;
      } catch (error) {
        console.error("Error restoring course from cache:", error);
        return null;
      }
    },
    []
  );

  // Combined cache restoration and data fetching effect
  useEffect(() => {
    if (!currentSlug) {
      notFound();
      return;
    }

    // Reset for new slug
    hasRequestedRef.current = false;
    setError(null);

    // Try to restore from cache first
    const cachedCourse = restoreCourseFromCache(currentSlug);

    if (cachedCourse) {
      // Cache hit - use cached data
      setCourse(cachedCourse);
      setLoading(false);
      return;
    }

    // Cache miss - fetch fresh data

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    async function fetchCourse() {
      if (!currentSlug) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/courses/${encodeURIComponent(currentSlug)}`
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
        saveCourseToCache(currentSlug, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Error fetching course:", err);
        hasRequestedRef.current = false; // Reset on error to allow retry
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [currentSlug, restoreCourseFromCache, saveCourseToCache]);

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
