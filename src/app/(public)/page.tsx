"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CourseCard } from "@/components/CourseCard/CourseCard";
import { useBadgeTranslation, getBadgeStyle } from "@/lib/badges";
import { convertToMyanmarNumber } from "@/lib/utils";
import { getFontSizeClasses } from "@/lib/font-sizes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated interface to match new schema - only fields needed for CourseCard component
interface Course {
  id: string;
  slug: string;
  title: string;
  titleMm: string | null;
  // Updated: DateTime types for dates
  startDate: string; // ISO string format for frontend
  startDateMm: string | null;
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  startByDate?: string | null;
  startByDateMm?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  // Updated: numeric types for duration
  duration: number;
  durationUnit: string;
  durationMm: number | null;
  durationUnitMm?: string;
  // Updated: fee is now numeric
  feeAmount?: number;
  feeAmountMm?: number | null;
  // Course location fields
  district?: string | null;
  province?: string | null;
  organizationInfo?: {
    name: string;
  } | null;
  images: {
    id: string;
    url: string;
    courseId: string;
  }[];
  badges: {
    id: string;
    text: string;
    color: string;
    backgroundColor: string;
    courseId: string;
  }[];
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
  createdAt?: string;
}

// Cache key for storing course data
const COURSE_CACHE_KEY = "courseCache";
const SCROLL_CACHE_KEY = "homeScrollPosition";

export default function Home() {
  const { t, language } = useLanguage();
  const { translateBadge } = useBadgeTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("startDate-asc");

  // Cache management functions
  const savePageState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const cacheData = {
          courses,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(COURSE_CACHE_KEY, JSON.stringify(cacheData));
        sessionStorage.setItem(SCROLL_CACHE_KEY, window.scrollY.toString());
      } catch (error) {
        console.error("Error saving page state:", error);
      }
    }
  }, [courses]);

  const restorePageState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(COURSE_CACHE_KEY);
        if (cached) {
          const cacheData = JSON.parse(cached);
          // Cache valid for 5 minutes
          if (Date.now() - cacheData.timestamp < 5 * 60 * 1000) {
            setCourses(cacheData.courses);
            setLoading(false);
            return true;
          } else {
            // Clear expired cache
            sessionStorage.removeItem(COURSE_CACHE_KEY);
            sessionStorage.removeItem(SCROLL_CACHE_KEY);
          }
        }
      } catch (error) {
        console.error("Error restoring page state:", error);
      }
    }
    return false;
  }, []);

  // Cache-first course fetching
  useEffect(() => {
    // Try to restore from cache first
    const wasRestored = restorePageState();
    
    if (!wasRestored) {
      // If cache miss, fetch fresh data
      const fetchCourses = async () => {
        try {
          const response = await fetch("/api/courses/public?legacy=true");
          if (!response.ok) {
            throw new Error("Failed to fetch courses");
          }
          const data = await response.json();
          const coursesData = Array.isArray(data) ? data : data.courses || [];
          setCourses(coursesData);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [restorePageState]); // Only run once on mount

  // Scroll position restoration
  useEffect(() => {
    if (!loading && courses.length > 0) {
      // Restore scroll position after content loads
      setTimeout(() => {
        const savedScrollPos = sessionStorage.getItem(SCROLL_CACHE_KEY);
        if (savedScrollPos) {
          window.scrollTo(0, parseInt(savedScrollPos, 10));
          sessionStorage.removeItem(SCROLL_CACHE_KEY); // Clean up after use
        }
      }, 100); // Small delay to ensure content is rendered
    }
  }, [loading, courses.length]);

  // Save state before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!loading && courses.length > 0) {
        savePageState();
      }
    };

    // Save state when navigating to course details
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const courseCard = target.closest('[data-course-slug]');
      if (courseCard) {
        savePageState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick);
    };
  }, [loading, courses.length, savePageState]);

  // ADD THESE SORT OPTIONS:
  const sortOptions = [
    { value: "default", label: t("sort.default") },
    { value: "startDate-asc", label: t("sort.startDate.earliest") },
    { value: "startDate-desc", label: t("sort.startDate.latest") },
    { value: "applyByDate-asc", label: t("sort.applyByDate.earliest") },
    { value: "applyByDate-desc", label: t("sort.applyByDate.latest") },
  ];


  // Load saved filter state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = sessionStorage.getItem("courseFilters");
        if (savedState) {
          const { searchTerm: savedSearch, activeFilters: savedFilters } =
            JSON.parse(savedState);
          if (savedSearch) setSearchTerm(savedSearch);
          if (savedFilters && Array.isArray(savedFilters))
            setActiveFilters(savedFilters);
        }
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    }
  }, []);

  // Save state to sessionStorage whenever searchTerm or activeFilters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "courseFilters",
          JSON.stringify({
            searchTerm,
            activeFilters,
          })
        );
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    }
  }, [searchTerm, activeFilters]);


  // NEW: Get course status function
  const getCourseStatus = useCallback((course: Course) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(course.startDate);

    if (startDate < today) {
      return "started";
    }

    return "upcoming";
  }, []);

  // STEP 1: Filter courses available for filtering (without badge filtering)
  const coursesAvailableForFiltering = useMemo(() => {
    return courses.filter((course) => {
      // Hide courses that have already started
      const status = getCourseStatus(course);
      if (status === "started") {
        return false;
      }

      // Apply search filtering but NOT badge filtering yet
      if (searchTerm !== "") {
        const searchTermLower = searchTerm.toLowerCase();

        // Organization name search
        const organizationMatch =
          course.organizationInfo?.name
            ?.toLowerCase()
            .includes(searchTermLower) || false;

        // Basic fields search - only search available CourseCard fields
        const basicFieldsMatch =
          // Title search
          course.title?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.titleMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          // District and province search
          course.district?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.province?.toLowerCase().includes(searchTermLower) ||
          false;

        // Badges search
        const badgesMatch = course.badges.some((badge) =>
          badge.text.toLowerCase().includes(searchTermLower)
        );

        // Combine all search results
        const matchesSearch =
          organizationMatch || basicFieldsMatch || badgesMatch;

        return matchesSearch;
      }

      return true; // If no search term, include all non-started courses
    });
  }, [courses, searchTerm, getCourseStatus]);

  // Get all unique badge texts
  const availableBadges = useMemo(() => {
    const badgeSet = new Set<string>();
    coursesAvailableForFiltering.forEach((course) => {
      course.badges.forEach((badge) => {
        badgeSet.add(badge.text);
      });
    });
    return Array.from(badgeSet);
  }, [coursesAvailableForFiltering]);

  // Format date for display (convert from ISO string to localized format)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "mm" ? "my-MM" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format fee for display
  const formatFee = (amount: number | undefined): string | null => {
    if (amount === -1 || amount === undefined) return null; // Hide fee when -1 or undefined
    if (amount === 0) return "Free";
    return `฿${amount.toLocaleString()}`;
  };

  // ADD THIS SORT FUNCTION after the enhancedSearch function:
  const sortCourses = useCallback(
    (courses: Course[], sortBy: string): Course[] => {
      if (sortBy === "default") return courses;

      return [...courses].sort((a, b) => {
        switch (sortBy) {
          case "startDate-asc":
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);

            const isAFuture = dateA >= today;
            const isBFuture = dateB >= today;

            // If both are future dates, sort by earliest
            if (isAFuture && isBFuture) {
              return dateA.getTime() - dateB.getTime();
            }

            // If both are past dates, sort by most recent past first
            if (!isAFuture && !isBFuture) {
              return dateB.getTime() - dateA.getTime();
            }

            // If one is future and one is past, future comes first
            if (isAFuture && !isBFuture) return -1;
            if (!isAFuture && isBFuture) return 1;

            return 0;

          case "startDate-desc":
            return (
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );

          case "applyByDate-asc":
            if (!a.applyByDate && !b.applyByDate) return 0;
            if (!a.applyByDate) return 1;
            if (!b.applyByDate) return -1;

            const todayApply = new Date();
            todayApply.setHours(0, 0, 0, 0);

            const applyDateA = new Date(a.applyByDate);
            const applyDateB = new Date(b.applyByDate);

            const isAApplyFuture = applyDateA >= todayApply;
            const isBApplyFuture = applyDateB >= todayApply;

            if (isAApplyFuture && isBApplyFuture) {
              return applyDateA.getTime() - applyDateB.getTime();
            }

            if (!isAApplyFuture && !isBApplyFuture) {
              return applyDateB.getTime() - applyDateA.getTime();
            }

            if (isAApplyFuture && !isBApplyFuture) return -1;
            if (!isAApplyFuture && isBApplyFuture) return 1;

            return 0;

          case "applyByDate-desc":
            if (!a.applyByDate && !b.applyByDate) return 0;
            if (!a.applyByDate) return 1;
            if (!b.applyByDate) return -1;
            return (
              new Date(b.applyByDate).getTime() -
              new Date(a.applyByDate).getTime()
            );

          default:
            return 0;
        }
      });
    },
    []
  );

  // STEP 3: FIXED - Apply badge filtering to the pre-filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = coursesAvailableForFiltering;

    // Apply badge filter logic
    if (activeFilters.length > 0) {
      filtered = filtered.filter((course) => {
        return activeFilters.every((filterBadge) => {
          const filterBadgeText = filterBadge.toLowerCase().trim();
          return course.badges.some((courseBadge) => {
            const courseBadgeText = courseBadge.text.toLowerCase().trim();
            return courseBadgeText === filterBadgeText;
          });
        });
      });
    }

    // Apply sorting to filtered results
    return sortCourses(filtered, sortBy);
  }, [coursesAvailableForFiltering, activeFilters, sortBy, sortCourses]);

  // REMOVED: Save state before navigation - not needed for load more button approach

  // REMOVED: Scroll state saving - not needed for load more button approach


  // Toggle a filter badge
  const toggleFilter = (badge: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(badge)
        ? prevFilters.filter((f) => f !== badge)
        : [...prevFilters, badge]
    );
  };

  // Clear all filters and search
  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters([]);

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("courseFilters");
      // Also clear cache when filters change significantly
      sessionStorage.removeItem(COURSE_CACHE_KEY);
      sessionStorage.removeItem(SCROLL_CACHE_KEY);
    }
  };


  return (
    <>
      {/* Hero section with gradient background */}
      <div
        className="absolute top-0 left-0 w-full hero-gradient pt-40 pb-24 -mt-16"
        data-language={language}
      >
        <div className="max-w-6xl mx-auto px-1 sm:px-6 lg:px-8">
          <div
            className={`${getFontSizeClasses(
              "heading1",
              language
            )} text-white text-left pt-8`}
            data-language={language}
          >
            {t("home.welcome")}
          </div>
          <p
            className={`${getFontSizeClasses(
              "bodyLarge",
              language
            )} text-white max-w-2xl mt-4 text-left`}
            data-language={language}
          >
            {t("home.subtitle")}
          </p>
        </div>
      </div>

      {/* Search bar positioned to intersect with hero section */}
      <div className="search-container -mt-6 mb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
            {/* Search Input */}
            <div className="flex-1 bg-white rounded-lg  p-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t("home.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur(); // This hides the keyboard on mobile
                    }
                  }}
                  enterKeyHint="search"
                  data-language={language}
                  className={`w-full pl-10 py-3 rounded-md border-none focus:ring-2 focus:ring-primary ${getFontSizeClasses(
                    "bodyRegular",
                    language
                  )}`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of content in container */}
      <div className="content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter badges with sort dropdown */}
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-start">
                {/* Sort Dropdown - Minimalist text with arrow */}
                <div className="w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className="w-auto h-auto border-none bg-transparent p-0 text-sm font-medium hover:text-foreground focus:ring-0 focus:ring-offset-0 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>svg]:ml-2"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      <SelectValue placeholder={t("sort.placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-sm shadow-sm">
                      {sortOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-sm hover:bg-gray-50"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-start">
                {availableBadges.map((badge) => {
                    const badgeStyle = getBadgeStyle(badge);
                    const isActive = activeFilters.includes(badge);

                    return (
                      <button
                        key={badge}
                        onClick={() => toggleFilter(badge)}
                        className={`px-3 pt-1 pb-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70 ${
                          isActive
                            ? "ring-2 ring-offset-2 ring-gray-900"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: badgeStyle.backgroundColor,
                                color: badgeStyle.color,
                              }
                            : undefined
                        }
                      >
                        {translateBadge(badge)}
                      </button>
                    );
                  })}
              </div>

              {/* Clear All Filters button */}
              {(searchTerm || activeFilters.length > 0) && (
                <div className="flex justify-start">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors w-auto"
                  >
                    {t("home.filter.clear")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Course Grid */}
            <div className="space-y-6">
              {/* Results count */}
              {filteredCourses.length > 0 && (
                <p className="text-left text-sm text-muted-foreground mb-6 ml-1">
                  {language === "mm"
                    ? filteredCourses.length === 1
                      ? t("home.course.found").replace(
                          "{count}",
                          convertToMyanmarNumber(filteredCourses.length)
                        )
                      : t("home.courses.found").replace(
                          "{count}",
                          convertToMyanmarNumber(filteredCourses.length)
                        )
                    : `${filteredCourses.length} ${
                        filteredCourses.length === 1
                          ? t("home.course.found")
                          : t("home.courses.found")
                      }`}
                </p>
              )}

              {/* Course grid */}
              {loading ? (
                // Show skeleton for initial loading
                <div className="course-grid-flex">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={`skeleton-${i}`} className="course-card-flex">
                      <div className="w-full border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                        {/* Image skeleton */}
                        <Skeleton className="w-full h-48 rounded-md" />
                        
                        {/* Content skeleton */}
                        <div className="space-y-3">
                          {/* Title */}
                          <Skeleton className="h-5 w-3/4" />
                          
                          {/* Date info */}
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          
                          {/* Badges */}
                          <div className="flex gap-2 flex-wrap">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                          
                          {/* Organization */}
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="course-grid-flex">
                  {filteredCourses.map((course, index) => (
                    <div
                      key={course.id}
                      className="course-card-flex"
                      data-course-slug={course.slug}
                    >
                      <CourseCard
                        slug={course.slug}
                        images={course.images}
                        title={course.title}
                        titleMm={course.titleMm}
                        startDate={course.startDate ? formatDate(course.startDate) : ""}
                        startDateMm={
                          course.startDateMm ? formatDate(course.startDateMm) : null
                        }
                        startByDate={
                          course.startByDate
                            ? formatDate(course.startByDate)
                            : undefined
                        }
                        startByDateMm={
                          course.startByDateMm
                            ? formatDate(course.startByDateMm)
                            : undefined
                        }
                        duration={course.duration}
                        durationUnit={course.durationUnit}
                        durationMm={course.durationMm}
                        durationUnitMm={course.durationUnitMm}
                        applyByDate={
                          course.applyByDate
                            ? formatDate(course.applyByDate)
                            : undefined
                        }
                        applyByDateMm={
                          course.applyByDateMm
                            ? formatDate(course.applyByDateMm)
                            : undefined
                        }
                        estimatedDate={course.estimatedDate}
                        estimatedDateMm={course.estimatedDateMm}
                        fee={course.feeAmount !== -1 ? formatFee(course.feeAmount) : undefined}
                        feeMm={course.feeAmountMm ? formatFee(course.feeAmountMm) : null}
                        badges={course.badges}
                        organizationInfo={
                          course.organizationInfo
                            ? { name: course.organizationInfo.name }
                            : null
                        }
                        createdByUser={course.createdByUser}
                        district={course.district}
                        province={course.province}
                        showSwipeHint={index === 0}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* No results display */}
                  <div className="flex flex-col items-center justify-center py-16">
                  <div className="no-results-icon">🔎</div>
                  <h3
                    className={`${getFontSizeClasses(
                      "heading3",
                      language
                    )} font-bold mb-2`}
                  >
                    {t("home.no.results")}
                  </h3>
                  <p
                    className={`${getFontSizeClasses(
                      "bodyRegular",
                      language
                    )} text-muted-foreground max-w-md`}
                  >
                    {t("home.no.results.desc")}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {t("home.clear.search")}
                  </button>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>

      {/* Spacing between course content and footer */}
      <div className="pb-16"></div>

      {/* Footer with navigation links */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">
                  JumpStudy.org
                </span>
              </Link>
            </div>

            <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/youthadvocates"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {language === "mm"
                  ? "လူငယ်ကိုယ်စားလှယ်များ"
                  : "Youth Advocates"}
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} JumpStudy.org. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
