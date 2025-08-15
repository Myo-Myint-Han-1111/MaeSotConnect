"use client";

import React, { useEffect, useState, useCallback } from "react";
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

// Cache management constants
const COURSE_DETAILS_CACHE_KEY = 'courseDetailsCache';
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
  const [cacheRestored, setCacheRestored] = useState(false);

  // Get the current slug
  const currentSlug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;

  // Cache management functions
  const saveCourseToCache = useCallback((slug: string, courseData: CourseDetail) => {
    if (typeof window === "undefined") return;
    
    try {
      const cached = JSON.parse(sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY) || '{}') as CachedCourseDetails;
      cached[slug] = {
        course: courseData,
        timestamp: Date.now()
      };
      sessionStorage.setItem(COURSE_DETAILS_CACHE_KEY, JSON.stringify(cached));
      console.log('Course details saved to cache:', slug);
    } catch (error) {
      console.error('Error saving course to cache:', error);
    }
  }, []);

  const restoreCourseFromCache = useCallback((slug: string): CourseDetail | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const cached = JSON.parse(sessionStorage.getItem(COURSE_DETAILS_CACHE_KEY) || '{}') as CachedCourseDetails;
      const courseCache = cached[slug];
      
      if (!courseCache) {
        console.log('No cache found for course:', slug);
        return null;
      }
      
      // Check if cache is still valid
      if (Date.now() - courseCache.timestamp > COURSE_DETAILS_CACHE_DURATION) {
        console.log('Cache expired for course:', slug);
        delete cached[slug];
        sessionStorage.setItem(COURSE_DETAILS_CACHE_KEY, JSON.stringify(cached));
        return null;
      }
      
      console.log('Course details restored from cache:', slug);
      return courseCache.course;
    } catch (error) {
      console.error('Error restoring course from cache:', error);
      return null;
    }
  }, []);

  // Cache restoration on mount
  useEffect(() => {
    if (!currentSlug) {
      notFound();
      return;
    }

    // Try to restore from cache first
    const cachedCourse = restoreCourseFromCache(currentSlug);
    if (cachedCourse) {
      setCourse(cachedCourse);
      setLoading(false);
      setCacheRestored(true);
      console.log('Course details loaded from cache immediately');
    }
  }, [currentSlug, restoreCourseFromCache]);

  // Data fetching effect
  useEffect(() => {
    async function fetchCourse() {
      if (!currentSlug) {
        notFound();
        return;
      }

      try {
        // If cache was restored, do background refresh
        if (cacheRestored) {
          console.log('Cache restored, doing background refresh for course');
          const response = await fetch(`/api/courses/${encodeURIComponent(currentSlug)}`);
          if (response.ok) {
            const data = await response.json();
            // Only update if data is different (simple check)
            if (JSON.stringify(data) !== JSON.stringify(course)) {
              setCourse(data);
              saveCourseToCache(currentSlug, data);
              console.log('Background refresh: course data updated');
            }
          }
          return;
        }

        // Normal fetch for first-time load or cache miss
        console.log('Fetching course details from API:', currentSlug);
        const response = await fetch(`/api/courses/${encodeURIComponent(currentSlug)}`);
        
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
        console.log('Course details fetched and cached');
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        if (!cacheRestored) {
          setLoading(false);
        }
      }
    }

    fetchCourse();
  }, [currentSlug, cacheRestored, course, saveCourseToCache]);

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
