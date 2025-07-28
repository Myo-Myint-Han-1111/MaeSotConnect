"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CourseCard } from "@/components/CourseCard/CourseCard";
import { BADGE_STYLES } from "@/components/common/BadgeDisplay";
import { convertToMyanmarNumber } from "@/lib/utils";
import { getFontSizeClasses } from "@/lib/font-sizes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated interface to match new schema
interface Course {
  id: string;
  slug: string;
  title: string;
  titleMm: string | null;
  subtitle: string;
  subtitleMm: string | null;
  // Updated: DateTime types for dates
  startDate: string; // ISO string format for frontend
  startDateMm: string | null;
  endDate: string; // New field
  endDateMm: string | null; // New field
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  estimatedDate?: string | null; // Add this line
  estimatedDateMm?: string | null;
  // Updated: numeric types for duration
  duration: number;
  durationMm: number | null;
  schedule: string;
  scheduleMm: string | null;
  // Updated: fee is now numeric
  feeAmount?: number;
  feeAmountMm?: number | null;
  // New age range fields
  ageMin: number;
  ageMinMm: number | null;
  ageMax: number;
  ageMaxMm: number | null;
  // New document fields
  document: string;
  documentMm: string | null;
  // Course location fields
  district?: string | null;
  province?: string | null;
  availableDays: boolean[];
  description?: string;
  descriptionMm?: string | null;
  outcomes?: string[];
  outcomesMm?: string[];
  scheduleDetails?: string;
  scheduleDetailsMm?: string | null;
  selectionCriteria?: string[];
  selectionCriteriaMm?: string[];
  organizationInfo?: {
    id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebookPage?: string;
    latitude: number;
    longitude: number;
    district?: string;
    province?: string;
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
  faq?: {
    question: string;
    questionMm: string | null;
    answer: string;
    answerMm: string | null;
  }[];
}

export default function Home() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("default");

  // ADD THESE SORT OPTIONS:
  const sortOptions = [
    { value: "default", label: t("sort.default") },
    { value: "startDate-asc", label: t("sort.startDate.earliest") },
    { value: "startDate-desc", label: t("sort.startDate.latest") },
    { value: "applyByDate-asc", label: t("sort.applyByDate.earliest") },
    { value: "applyByDate-desc", label: t("sort.applyByDate.latest") },
  ];

  // Load saved state from sessionStorage on component mount
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

  // Fetch courses from API
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/courses/public");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("homeScrollPosition");
    console.log("Restoring scroll position:", savedPosition);
    if (savedPosition) {
      // Increase delay and add multiple attempts
      const scrollToPosition = () => {
        const targetPosition = parseInt(savedPosition, 10);
        window.scrollTo(0, targetPosition);

        // Verify it actually scrolled
        setTimeout(() => {
          if (Math.abs(window.scrollY - targetPosition) > 50) {
            // If not close enough, try again
            window.scrollTo(0, targetPosition);
          }
        }, 50);
      };

      // Try multiple times with increasing delays
      setTimeout(scrollToPosition, 200); // Increased from 100ms
      setTimeout(scrollToPosition, 500); // Backup attempt

      // Clean up
      setTimeout(() => {
        sessionStorage.removeItem("homeScrollPosition");
      }, 600);
    }
  }, []);

  // Get all unique badge texts from courses for filter options
  const allBadges = useMemo(() => {
    const badgeSet = new Set<string>();
    courses.forEach((course) => {
      course.badges.forEach((badge) => {
        badgeSet.add(badge.text);
      });
    });
    return Array.from(badgeSet);
  }, [courses]);

  // Format duration for display (convert from number to string)
  const formatDuration = useCallback(
    (duration: number): string => {
      if (duration < 7) {
        return `${duration} ${
          duration === 1
            ? language === "mm"
              ? "ရက်"
              : "day"
            : language === "mm"
            ? "ရက်"
            : "days"
        }`;
      } else if (duration < 30) {
        const weeks = duration / 7;
        const formattedWeeks =
          weeks % 1 === 0 ? weeks.toString() : weeks.toFixed(1);

        return `${formattedWeeks} ${language === "mm" ? "ပတ်" : "week"}`;
      } else if (duration < 365) {
        const months = duration / 30.44;
        const formattedMonths =
          months % 1 < 0.1 || months % 1 > 0.9
            ? Math.round(months).toString()
            : months.toFixed(1);

        return `${formattedMonths} ${language === "mm" ? "လ" : "month"}`;
      } else {
        const years = duration / 365;
        const formattedYears =
          years % 1 === 0 ? years.toString() : years.toFixed(1);
        return `${formattedYears} ${language === "mm" ? "နှစ်" : "year"}`;
      }
    },
    [language]
  );

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
  const formatFee = (amount: number | undefined): string => {
    if (amount === undefined || amount === 0) return "Free";
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

  // Filter courses based on search term and active filters
  const filteredCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      // Search logic
      let matchesSearch = true;
      if (searchTerm !== "") {
        // Convert search term to lowercase for case-insensitive search
        const searchTermLower = searchTerm.toLowerCase();

        // Organization name search
        const organizationMatch =
          course.organizationInfo?.name
            ?.toLowerCase()
            .includes(searchTermLower) || false;

        // Basic fields search
        const basicFieldsMatch =
          // Title and subtitle
          course.title?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.titleMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.subtitle?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.subtitleMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          // Location
          course.organizationInfo?.address
            ?.toLowerCase()
            .includes(searchTermLower) ||
          false ||
          // District and province search (new fields)
          course.organizationInfo?.district
            ?.toLowerCase()
            .includes(searchTermLower) ||
          false ||
          course.organizationInfo?.province
            ?.toLowerCase()
            .includes(searchTermLower) ||
          false ||
          // Schedule and duration
          course.schedule?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.scheduleMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          // Document search (new field)
          course.document?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.documentMm?.toLowerCase().includes(searchTermLower) ||
          false;

        // Description search
        const descriptionMatch =
          course.description?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.descriptionMm?.toLowerCase().includes(searchTermLower) ||
          false;

        // Outcomes search
        const outcomesMatch =
          course.outcomes?.some((outcome) =>
            outcome.toLowerCase().includes(searchTermLower)
          ) ||
          course.outcomesMm?.some((outcome) =>
            outcome.toLowerCase().includes(searchTermLower)
          ) ||
          false;

        // Selection criteria search
        const criteriaMatch =
          course.selectionCriteria?.some((criteria) =>
            criteria.toLowerCase().includes(searchTermLower)
          ) ||
          course.selectionCriteriaMm?.some((criteria) =>
            criteria.toLowerCase().includes(searchTermLower)
          ) ||
          false;

        // Schedule details search
        const scheduleDetailsMatch =
          course.scheduleDetails?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.scheduleDetailsMm?.toLowerCase().includes(searchTermLower) ||
          false;

        // FAQ search
        const faqMatch =
          course.faq?.some(
            (faqItem) =>
              faqItem.question.toLowerCase().includes(searchTermLower) ||
              faqItem.questionMm?.toLowerCase().includes(searchTermLower) ||
              false ||
              faqItem.answer.toLowerCase().includes(searchTermLower) ||
              faqItem.answerMm?.toLowerCase().includes(searchTermLower) ||
              false
          ) || false;

        // Badges search
        const badgesMatch = course.badges.some((badge) =>
          badge.text.toLowerCase().includes(searchTermLower)
        );

        // Combine all search results
        matchesSearch =
          organizationMatch ||
          basicFieldsMatch ||
          descriptionMatch ||
          outcomesMatch ||
          criteriaMatch ||
          scheduleDetailsMatch ||
          faqMatch ||
          badgesMatch;
      }

      // Badge filter logic
      let matchesFilters = true;
      if (activeFilters.length > 0) {
        matchesFilters = activeFilters.every((filterBadge) => {
          const filterBadgeText = filterBadge.toLowerCase().trim();
          return course.badges.some((courseBadge) => {
            const courseBadgeText = courseBadge.text.toLowerCase().trim();
            return courseBadgeText === filterBadgeText;
          });
        });
      }

      return matchesSearch && matchesFilters;
    });

    // Apply sorting to filtered results
    return sortCourses(filtered, sortBy);
  }, [searchTerm, activeFilters, courses, sortBy, sortCourses]);

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
      sessionStorage.removeItem("homeScrollPosition");
    }
  };

  // Function to translate badge text - HANDLES LEGACY BADGES
  const translateBadge = (badgeText: string) => {
    // Handle legacy badge mapping
    let normalizedBadgeText = badgeText;

    // Map legacy "In-Person" to new "In-person" format
    if (badgeText === "In-Person") {
      normalizedBadgeText = "In-person";
    }

    // Try to use the translation from language context
    const translationKey = `badge.${normalizedBadgeText.toLowerCase()}`;
    const translation = t(translationKey);

    // Return the translation if it exists, otherwise return the normalized text
    return translationKey !== translation ? translation : normalizedBadgeText;
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <div
          className="absolute top-0 left-0 w-full hero-gradient pt-40 pb-24 -mt-16"
          data-language={language}
        >
          <div className="max-w-6xl mx-auto px-1 sm:px-6 lg:px-8">
            <div className="w-full">
              <div
                className={`${getFontSizeClasses(
                  "heading1",
                  language
                )} text-white text-left pt-8 w-full`}
                data-language={language}
              >
                {t("home.welcome")}
              </div>
              <p
                className={`${getFontSizeClasses(
                  "bodyLarge",
                  language
                )} text-white max-w-2xl mt-4 text-left w-full`}
                data-language={language}
              >
                {t("home.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="content -mt-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      </>
    );
  }

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
                {allBadges.map((badge) => {
                  // Debug: log the badge text to see what you're getting
                  console.log("Badge from database:", badge);

                  // Use the centralized badge system to get styles
                  // Try exact match first, then fallback
                  let badgeStyle = BADGE_STYLES[badge];

                  // If no exact match, try common variations
                  if (!badgeStyle) {
                    // Check for common variations
                    const variations = [
                      badge.trim(),
                      badge.toLowerCase(),
                      badge.charAt(0).toUpperCase() +
                        badge.slice(1).toLowerCase(),
                    ];

                    for (const variation of variations) {
                      if (BADGE_STYLES[variation]) {
                        badgeStyle = BADGE_STYLES[variation];
                        break;
                      }
                    }
                  }

                  // Final fallback
                  if (!badgeStyle) {
                    badgeStyle = {
                      text: badge,
                      color: "#333",
                      backgroundColor: "#e5e5e5",
                    };
                  }

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
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mt-2 ml-1"
                >
                  {t("home.filter.clear")}
                </button>
              )}
            </div>
          </div>

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

          {/* Course cards grid */}
          {filteredCourses.length > 0 ? (
            <div className="course-grid-flex mt-4">
              {filteredCourses.map((course, index) => (
                <div key={course.id} className="course-card-flex">
                  <CourseCard
                    id={course.id}
                    slug={course.slug}
                    images={course.images}
                    title={course.title}
                    titleMm={course.titleMm || null}
                    subtitle={course.subtitle}
                    subtitleMm={course.subtitleMm || null}
                    startDate={formatDate(course.startDate)}
                    startDateMm={
                      course.startDateMm ? formatDate(course.startDateMm) : null
                    }
                    duration={formatDuration(course.duration)}
                    durationMm={
                      course.durationMm
                        ? formatDuration(course.durationMm)
                        : null
                    }
                    // schedule={course.schedule}
                    // scheduleMm={course.scheduleMm || null}
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
                    estimatedDate={course.estimatedDate || null} // Add this line
                    estimatedDateMm={course.estimatedDateMm || null}
                    fee={
                      course.feeAmount ? formatFee(course.feeAmount) : undefined
                    }
                    feeMm={
                      course.feeAmountMm ? formatFee(course.feeAmountMm) : null
                    }
                    availableDays={course.availableDays}
                    badges={course.badges}
                    organizationInfo={course.organizationInfo}
                    district={course.district}
                    province={course.province}
                    showSwipeHint={index === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            // No courses found section remains the same
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
          )}
        </div>
      </div>

      {/* Footer with navigation links */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">
                  ThailandStudyGuide.org
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
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} ThailandStudyGuide.org. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
