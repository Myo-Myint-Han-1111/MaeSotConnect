"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CourseCard } from "@/components/CourseCard/CourseCard";
import { BADGE_STYLES } from "@/components/Badges/BadgeSystem";
import { convertToMyanmarNumber } from "@/lib/utils";
import { getFontSizeClasses } from "@/lib/font-sizes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

// Updated interface to match new schema
interface Course {
  id: string;
  title: string;
  titleMm: string | null;
  subtitle: string;
  subtitleMm: string | null;
  // Updated: DateTime types for dates
  startDate: string; // ISO string format for frontend
  startDateMm: string | null;
  endDate: string; // New field
  endDateMm: string | null; // New field
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
  const formatDuration = (duration: number): string => {
    if (duration < 30) {
      return `${duration} days`;
    } else if (duration < 365) {
      const months = Math.round(duration / 30);
      return `${months} ${months === 1 ? "month" : "months"}`;
    } else {
      const years = Math.round((duration / 365) * 10) / 10;
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
  };

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

  // Enhanced search function for bilingual search
  const enhancedSearch = useCallback(
    (text: string | null, mmText: string | null, query: string): boolean => {
      // If no search query, return true (match everything)
      if (!query) return true;

      // If text or mmText is empty, don't fail immediately - check the other one
      if (!text && !mmText) return false;

      // Normalize text: convert to lowercase, remove extra spaces and special characters
      const normalizeText = (str: string): string =>
        str
          .toLowerCase()
          .replace(/[^\w\s]/gi, "") // Remove special characters
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();

      const normalizedQuery = normalizeText(query);

      // Check English text if available
      if (text) {
        const normalizedText = normalizeText(text);

        // Direct match (most relevant)
        if (normalizedText.includes(normalizedQuery)) return true;

        // Check for word boundary matches
        const words = normalizedQuery.split(" ");
        const textWords = normalizedText.split(" ");

        // Match if ALL query words are found in the text (in any order)
        const allWordsMatch = words.every(
          (word) =>
            word.length > 0 &&
            textWords.some((textWord) => textWord.includes(word))
        );

        // Match if any COMPLETE word in the query matches a word in the text
        const anyCompleteWordMatch = words.some(
          (word) => word.length > 1 && textWords.includes(word)
        );

        if (allWordsMatch || anyCompleteWordMatch) return true;
      }

      // Check Myanmar text if available
      if (mmText) {
        const normalizedMmText = normalizeText(mmText);

        // Direct match
        if (normalizedMmText.includes(normalizedQuery)) return true;

        // Word matches for Myanmar text
        const words = normalizedQuery.split(" ");
        const mmTextWords = normalizedMmText.split(" ");

        const allMmWordsMatch = words.every(
          (word) =>
            word.length > 0 &&
            mmTextWords.some((textWord) => textWord.includes(word))
        );

        const anyCompleteMmWordMatch = words.some(
          (word) => word.length > 1 && mmTextWords.includes(word)
        );

        if (allMmWordsMatch || anyCompleteMmWordMatch) return true;
      }

      return false;
    },
    []
  );

  // Filter courses based on search term and active filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
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
  }, [searchTerm, activeFilters, courses]);

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
  };

  // Function to translate badge text
  const translateBadge = (badgeText: string) => {
    // Handle special case
    if (badgeText === "In-Person") return t("badge.inperson");

    // Try to use the translation from language context
    const translationKey = `badge.${badgeText.toLowerCase()}`;
    const translation = t(translationKey);

    // Return the translation if it exists, otherwise return the original text
    return translationKey !== translation ? translation : badgeText;
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <div
          className="absolute top-0 left-0 w-full hero-gradient pt-40 pb-24 -mt-16"
          data-language={language}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-xl bg-white rounded-lg shadow-lg p-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t("home.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Rest of content in container */}
      <div className="content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter badges */}
          <div className="mb-6">
            <div className="flex flex-col items-start gap-4">
              <span className="text-sm text-muted-foreground ml-1">
                {t("home.filter.category")}
              </span>

              <div className="flex flex-wrap gap-3 justify-start">
                {allBadges.map((badge) => {
                  // Use the centralized badge system to get styles
                  const badgeStyle = BADGE_STYLES[badge] || {
                    color: "#333",
                    backgroundColor: "#e5e5e5",
                  };

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
                ? convertToMyanmarNumber(filteredCourses.length)
                : filteredCourses.length}{" "}
              {filteredCourses.length === 1
                ? t("home.course.found")
                : t("home.courses.found")}
            </p>
          )}

          {/* Course cards grid */}
          {filteredCourses.length > 0 ? (
            <div className="course-grid-flex mt-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="course-card-flex">
                  <CourseCard
                    id={course.id}
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
                    schedule={course.schedule}
                    scheduleMm={course.scheduleMm || null}
                    fee={
                      course.feeAmount ? formatFee(course.feeAmount) : undefined
                    }
                    feeMm={
                      course.feeAmountMm ? formatFee(course.feeAmountMm) : null
                    }
                    availableDays={course.availableDays}
                    badges={course.badges}
                    organizationInfo={course.organizationInfo}
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
                  StudyinThailand.org
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
                href="/contact"
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                {t("nav.contact")}
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} StudyinThailand.org. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
