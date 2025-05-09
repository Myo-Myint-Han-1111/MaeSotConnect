"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CourseCard } from "@/components/CourseCard/CourseCard";
import { BADGE_STYLES } from "@/components/Badges/BadgeSystem";
import { convertToMyanmarNumber } from "@/lib/utils";
import { getFontSizeClasses } from "@/lib/font-sizes";

interface Course {
  id: string;
  title: string;
  titleMm: string | null;
  subtitle: string;
  subtitleMm: string | null;
  location: string;
  locationMm: string | null;
  startDate: string;
  startDateMm: string | null;
  duration: string;
  durationMm: string | null;
  schedule: string;
  scheduleMm: string | null;
  fee?: string;
  feeMm: string | null;
  description?: string;
  descriptionMm?: string | null;
  outcomes?: string[];
  outcomesMm?: string[];
  scheduleDetails?: string;
  scheduleDetailsMm?: string | null;
  selectionCriteria?: string[];
  selectionCriteriaMm?: string[];
  availableDays: boolean[];
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
          course.location?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.locationMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          // Schedule and duration
          course.schedule?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.scheduleMm?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.duration?.toLowerCase().includes(searchTermLower) ||
          false ||
          course.durationMm?.toLowerCase().includes(searchTermLower) ||
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
        <div className="w-full hero-section pt-20" data-language={language}>
          <div className="max-w-6xl mx-auto px-4">
            <div
              className={`${getFontSizeClasses(
                "heading1",
                language
              )} text-white`}
              data-language={language}
            >
              {t("home.welcome")}
            </div>
            <p
              className={`${getFontSizeClasses(
                "bodyLarge",
                language
              )} text-white max-w-2xl mx-auto mt-2`}
              data-language={language}
            >
              {t("home.subtitle")}
            </p>
          </div>
        </div>

        <div className="content">
          <div className="flex items-center justify-center py-20">
            <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero section - Now full width with space below navbar */}
      <div className="w-full hero-section pt-20" data-language={language}>
        <div className="max-w-6xl mx-auto px-4">
          <div
            className={`${getFontSizeClasses("heading1", language)} text-white`}
            data-language={language}
          >
            {t("home.welcome")}
          </div>
          <p
            className={`${getFontSizeClasses(
              "bodyLarge",
              language
            )} text-white max-w-2xl mx-auto mt-2`}
            data-language={language}
          >
            {t("home.subtitle")}
          </p>
        </div>
      </div>

      {/* Rest of content in container */}
      <div className="content">
        <div className="section">
          {/* Search bar */}
          <div className="search-container mb-6">
            <div className="relative w-full max-w-xl mx-auto">
              <input
                type="text"
                placeholder={t("home.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-language={language}
                className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${getFontSizeClasses(
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

          {/* Filter badges */}
          <div className="mb-6">
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t("home.filter.category")}
              </span>

              <div className="flex flex-wrap gap-3 justify-center">
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
                      className={`px-3 pt-1 pb-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: badgeStyle.backgroundColor,
                        color: badgeStyle.color,
                      }}
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
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mt-2"
                >
                  {t("home.filter.clear")}
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          {filteredCourses.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  images={course.images} // Now passing the correct image object structure
                  title={course.title}
                  titleMm={course.titleMm || null} // Convert undefined to null
                  subtitle={course.subtitle}
                  subtitleMm={course.subtitleMm || null} // Convert undefined to null
                  location={course.location}
                  locationMm={course.locationMm || null} // Convert undefined to null
                  startDate={course.startDate}
                  startDateMm={course.startDateMm || null} // Convert undefined to null
                  duration={course.duration}
                  durationMm={course.durationMm || null} // Convert undefined to null
                  schedule={course.schedule}
                  scheduleMm={course.scheduleMm || null} // Convert undefined to null
                  fee={course.fee}
                  feeMm={course.feeMm || null} // Convert undefined to null
                  availableDays={course.availableDays}
                  badges={course.badges} // Now passing the correct badge object structure
                />
              ))}
            </div>
          ) : (
            // For No courses Found
            <div className="text-center py-16">
              <div className="no-results-icon mx-auto">🔎</div>
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
                )} text-muted-foreground max-w-md mx-auto`}
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
    </>
  );
}
