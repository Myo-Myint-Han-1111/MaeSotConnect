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

// Enhanced search utilities with typo tolerance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
}

// Common typo patterns
const commonTypos: Record<string, string[]> = {
  language: ["langauge", "languag", "languge", "lanuage"],
  computer: ["compter", "computr", "comuter", "compuer"],
  course: ["cours", "corse", "coures", "coursse"],
  sewing: ["seing", "sewng", "sewig"],
  english: ["englsh", "engish", "enlish"],
  thai: ["tai", "thi", "thia"],
  free: ["fre", "fee"],
  beginner: ["beginer", "beginr", "begginer"],
  technology: ["tecnology", "techology", "tehnology", "technlogy"],
  vocational: ["vocatinal", "vocatonal", "voctional"],
  internship: ["internshp", "intership", "internshipp"],
};

function matchesTypoPattern(searchWord: string, targetWord: string): boolean {
  const lowerSearch = searchWord.toLowerCase();
  const lowerTarget = targetWord.toLowerCase();

  if (commonTypos[lowerTarget]?.includes(lowerSearch)) return true;

  for (const [correct, typos] of Object.entries(commonTypos)) {
    if (typos.includes(lowerSearch) && correct === lowerTarget) return true;
  }

  return false;
}

function generateSearchSuggestions(
  searchTerm: string,
  courses: Course[]
): string[] {
  if (!searchTerm.trim()) return [];

  const allWords = new Set<string>();

  courses.forEach((course) => {
    const texts = [
      course.title,
      course.subtitle,
      course.organizationInfo?.name,
      course.description,
      ...course.badges.map((b) => b.text),
      ...(course.outcomes || []),
      ...(course.selectionCriteria || []),
    ].filter(Boolean);

    texts.forEach((text) => {
      if (text) {
        text
          .toString()
          .toLowerCase()
          .split(/\s+/)
          .forEach((word) => {
            if (word.length > 2) allWords.add(word);
          });
      }
    });
  });

  const queryWords = searchTerm.toLowerCase().trim().split(/\s+/);
  const suggestions = new Set<string>();

  queryWords.forEach((queryWord) => {
    Array.from(allWords).forEach((word) => {
      const similarity = calculateSimilarity(queryWord, word);
      if (similarity >= 0.6 && similarity < 1.0) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5);
}

export default function Home() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

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

  // Enhanced search with debouncing for suggestions
  const debouncedSearch = useMemo(() => {
    const debounce = <T extends unknown[]>(
      func: (...args: T) => void,
      wait: number
    ) => {
      let timeout: NodeJS.Timeout;
      return (...args: T) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    return debounce((term: string) => {
      if (term.trim() && courses.length > 0) {
        const suggestions = generateSearchSuggestions(term, courses);
        setSearchSuggestions(suggestions);
      } else {
        setSearchSuggestions([]);
      }
    }, 300);
  }, [courses]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

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

  // Enhanced flexible search function
  const flexibleSearch = useCallback(
    (
      course: Course,
      searchQuery: string,
      language: string
    ): { matches: boolean; score: number } => {
      if (!searchQuery.trim()) return { matches: true, score: 1 };

      const query = searchQuery.toLowerCase().trim();
      const queryWords = query.split(/\s+/).filter((word) => word.length > 0);

      let totalScore = 0;
      let matchedWords = 0;
      const minSimilarityThreshold = 0.6;

      // Fields to search with their weights
      const searchFields = [
        { content: course.title, weight: 3, contentMm: course.titleMm },
        { content: course.subtitle, weight: 2.5, contentMm: course.subtitleMm },
        { content: course.organizationInfo?.name, weight: 2, contentMm: null },
        {
          content: course.organizationInfo?.address,
          weight: 1.5,
          contentMm: null,
        },
        {
          content: course.organizationInfo?.district,
          weight: 1.5,
          contentMm: null,
        },
        {
          content: course.organizationInfo?.province,
          weight: 1.5,
          contentMm: null,
        },
        { content: course.schedule, weight: 1.8, contentMm: course.scheduleMm },
        {
          content: course.description,
          weight: 1.5,
          contentMm: course.descriptionMm,
        },
        { content: course.document, weight: 1.2, contentMm: course.documentMm },
        {
          content: course.scheduleDetails,
          weight: 1.2,
          contentMm: course.scheduleDetailsMm,
        },
        ...(course.outcomes?.map((outcome) => ({
          content: outcome,
          weight: 1.2,
          contentMm: null,
        })) || []),
        ...(course.outcomesMm?.map((outcome) => ({
          content: outcome,
          weight: 1.2,
          contentMm: null,
        })) || []),
        ...(course.selectionCriteria?.map((criteria) => ({
          content: criteria,
          weight: 1.1,
          contentMm: null,
        })) || []),
        ...(course.selectionCriteriaMm?.map((criteria) => ({
          content: criteria,
          weight: 1.1,
          contentMm: null,
        })) || []),
        ...(course.faq?.flatMap((faq) => [
          { content: faq.question, weight: 1.3, contentMm: faq.questionMm },
          { content: faq.answer, weight: 1.1, contentMm: faq.answerMm },
        ]) || []),
        ...course.badges.map((badge) => ({
          content: badge.text,
          weight: 1.5,
          contentMm: null,
        })),
      ];

      for (const field of searchFields) {
        if (!field.content) continue;

        const contentToSearch =
          language === "mm" && field.contentMm
            ? field.contentMm
            : field.content;
        const fieldText = contentToSearch.toString().toLowerCase();
        const fieldWords = fieldText.split(/\s+/);

        for (const queryWord of queryWords) {
          let bestMatchScore = 0;

          if (fieldText.includes(queryWord)) {
            bestMatchScore = 1.0;
          } else {
            for (const fieldWord of fieldWords) {
              if (fieldWord.length < 3 && queryWord.length < 3) {
                if (fieldWord === queryWord)
                  bestMatchScore = Math.max(bestMatchScore, 1.0);
                continue;
              }

              if (matchesTypoPattern(queryWord, fieldWord)) {
                bestMatchScore = Math.max(bestMatchScore, 0.9);
                continue;
              }

              const similarity = calculateSimilarity(queryWord, fieldWord);
              if (similarity >= minSimilarityThreshold) {
                bestMatchScore = Math.max(bestMatchScore, similarity);
              }

              if (
                fieldWord.startsWith(queryWord) ||
                queryWord.startsWith(fieldWord)
              ) {
                const partialScore =
                  Math.min(queryWord.length, fieldWord.length) /
                  Math.max(queryWord.length, fieldWord.length);
                if (partialScore >= 0.5) {
                  bestMatchScore = Math.max(bestMatchScore, partialScore * 0.8);
                }
              }
            }
          }

          if (bestMatchScore >= minSimilarityThreshold) {
            totalScore += bestMatchScore * field.weight;
            matchedWords++;
          }
        }
      }

      const finalScore = totalScore / (queryWords.length * 10);
      const matches =
        matchedWords / queryWords.length >= 0.7 || finalScore >= 0.15;

      return { matches, score: finalScore };
    },
    []
  );

  // Enhanced filter courses with flexible search
  const filteredCourses = useMemo(() => {
    let results = courses;

    // Apply flexible search if there's a search term
    if (searchTerm.trim()) {
      const searchResults = courses
        .map((course) => ({
          course,
          searchResult: flexibleSearch(course, searchTerm, language),
        }))
        .filter(({ searchResult }) => searchResult.matches)
        .sort((a, b) => b.searchResult.score - a.searchResult.score)
        .map(({ course }) => course);

      results = searchResults;
    }

    // Apply badge filters
    if (activeFilters.length > 0) {
      results = results.filter((course) =>
        activeFilters.every((filterBadge) =>
          course.badges.some(
            (courseBadge) =>
              courseBadge.text.toLowerCase().trim() ===
              filterBadge.toLowerCase().trim()
          )
        )
      );
    }

    return results;
  }, [searchTerm, activeFilters, courses, language, flexibleSearch]);

  // Handle search suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSearchSuggestions([]);
  };

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
    setSearchSuggestions([]);
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

      {/* Enhanced search bar with suggestions */}
      <div className="search-container -mt-6 mb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl bg-white rounded-lg shadow-lg p-1 relative">
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
                  onClick={() => {
                    setSearchTerm("");
                    setSearchSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search suggestions dropdown */}
            {searchSuggestions.length > 0 && searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-xs text-gray-500 border-b">
                  {language === "mm" ? "အကြံပြုချက်များ:" : "Did you mean:"}
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 capitalize"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
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

          {/* Enhanced results count with search info */}
          {filteredCourses.length > 0 && (
            <div className="mb-6 ml-1">
              <p className="text-left text-sm text-muted-foreground">
                {language === "mm"
                  ? convertToMyanmarNumber(filteredCourses.length)
                  : filteredCourses.length}{" "}
                {filteredCourses.length === 1
                  ? t("home.course.found")
                  : t("home.courses.found")}
              </p>

              {/* Show search info for typo-corrected searches */}
              {searchTerm.trim() && filteredCourses.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {language === "mm"
                    ? `"${searchTerm}" အတွက် ရှာဖွေမှုများ (တူညီသော အဓိပ္ပါယ်များ အပါအဝင်)`
                    : `Results for "${searchTerm}" (including similar matches)`}
                </p>
              )}
            </div>
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
                    location={course.organizationInfo?.address || ""}
                    locationMm={null}
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
                  />
                </div>
              ))}
            </div>
          ) : (
            // Enhanced no results section with suggestions
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
                )} text-muted-foreground max-w-md text-center mb-4`}
              >
                {searchTerm.trim()
                  ? language === "mm"
                    ? `"${searchTerm}" အတွက် ရလဒ်များ မတွေ့ရှိပါ။ အခြား စကားလုံးများ သုံးကြည့်ပါ သို့မဟုတ် ရိုးရှင်းသော စကားလုံးများ သုံးကြည့်ပါ။`
                    : `No results found for "${searchTerm}". Try different keywords or check spelling.`
                  : t("home.no.results.desc")}
              </p>

              {/* Show suggestions if available */}
              {searchSuggestions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {language === "mm"
                      ? "ဤစကားလုံးများကို ကြိုးစားကြည့်ပါ:"
                      : "Try these suggestions:"}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
