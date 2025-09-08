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
  applyByDate?: string | null;
  startByDate?: string | null;
  estimatedDate?: string | null;
  // Updated: numeric types for duration
  duration: number;
  durationUnit: string;
  durationUnitMm?: string;
  // Updated: fee is now numeric
  feeAmount?: number;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<string>("startDate-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isFromCache, setIsFromCache] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Cache management functions for pagination
  const savePageState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const cacheData = {
          courses,
          currentPage,
          totalCount,
          hasMore,
          searchTerm,
          activeFilters,
          sortBy,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(COURSE_CACHE_KEY, JSON.stringify(cacheData));
        sessionStorage.setItem(SCROLL_CACHE_KEY, window.scrollY.toString());
      } catch (error) {
        console.error("Error saving page state:", error);
      }
    }
  }, [courses, currentPage, totalCount, hasMore, searchTerm, activeFilters, sortBy]);

  const restorePageState = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(COURSE_CACHE_KEY);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const isValid = Date.now() - cacheData.timestamp < 5 * 60 * 1000;
          
          if (isValid) {
            // Restore all pagination state
            setCourses(cacheData.courses || []);
            setCurrentPage(cacheData.currentPage || 1);
            setTotalCount(cacheData.totalCount || 0);
            setHasMore(cacheData.hasMore || false);
            setSearchTerm(cacheData.searchTerm || "");
            setActiveFilters(cacheData.activeFilters || []);
            setSortBy(cacheData.sortBy || "startDate-asc");
            setIsFromCache(true);
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

  // Get responsive page limit based on screen size
  const getPageLimit = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 15 : 30; // Mobile: 15, Desktop: 30
    }
    return 15; // Default to mobile limit during SSR
  }, []);

  // Fetch courses function
  const fetchCourses = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const limit = getPageLimit();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (activeFilters.length > 0) params.append("badges", activeFilters.join(","));

      const response = await fetch(`/api/courses/public?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      
      const data = await response.json();
      
      
      if (isLoadMore) {
        setCourses(prev => [...prev, ...data.courses]);
      } else {
        setCourses(data.courses);
      }
      
      setHasMore(data.pagination.hasMore);
      setTotalCount(data.pagination.total);
      setCurrentPage(page);

    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy, searchTerm, activeFilters, getPageLimit]);

  // Initial course fetching
  useEffect(() => {
    // Try to restore from cache first
    const wasRestored = restorePageState();

    if (!wasRestored) {
      fetchCourses(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restorePageState]); // fetchCourses omitted to prevent infinite loop

  // Scroll position restoration
  useEffect(() => {
    if (!loading && courses.length > 0 && isFromCache) {
      // Restore scroll position after cached content loads
      // Use longer delay and multiple attempts for better reliability
      let attempts = 0;
      const maxAttempts = 5;
      
      const restoreScroll = () => {
        attempts++;
        const savedScrollPos = sessionStorage.getItem(SCROLL_CACHE_KEY);
        
        if (savedScrollPos) {
          const scrollPosition = parseInt(savedScrollPos, 10);
          window.scrollTo(0, scrollPosition);
          
          // Verify scroll worked (within 50px tolerance)
          setTimeout(() => {
            if (Math.abs(window.scrollY - scrollPosition) > 50 && attempts < maxAttempts) {
              // Scroll didn't work, try again
              restoreScroll();
            } else {
              // Success or max attempts reached, clean up
              sessionStorage.removeItem(SCROLL_CACHE_KEY);
            }
          }, 100);
        }
      };
      
      // Initial delay to ensure DOM is fully rendered
      setTimeout(restoreScroll, 300);
    }
  }, [loading, courses.length, isFromCache]);

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
      const courseCard = target.closest("[data-course-slug]");
      if (courseCard) {
        savePageState();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick);
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

  // Remove unused function since server now filters started courses

  // Get all unique badge texts from current courses
  const availableBadges = useMemo(() => {
    const badgeSet = new Set<string>();
    courses.forEach((course) => {
      course.badges.forEach((badge) => {
        badgeSet.add(badge.text);
      });
    });
    return Array.from(badgeSet);
  }, [courses]);

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

  // Remove old client-side sorting - now handled by API

  // Remove old filtering logic - now handled by API

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

  // Handle filter/search changes (only if not from cache restore)
  useEffect(() => {
    if (!loading && !isFromCache && hasInitialized) {
      setCurrentPage(1);
      fetchCourses(1);
    }
    // Reset the cache flag after initial load
    if (isFromCache) {
      setIsFromCache(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeFilters, sortBy, isFromCache, hasInitialized]); // fetchCourses and loading omitted to prevent infinite loop

  // Load more function
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      fetchCourses(nextPage, true);
    }
  };

  // Auto-save state whenever courses/pagination data changes
  useEffect(() => {
    if (!loading && courses.length > 0 && !isFromCache && hasInitialized) {
      // Small delay to avoid saving during rapid state changes
      const timeoutId = setTimeout(() => {
        savePageState();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [courses, currentPage, hasMore, totalCount, savePageState, loading, isFromCache, hasInitialized]);

  // Clear all filters and search
  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters([]);
    setCurrentPage(1);

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("courseFilters");
      sessionStorage.removeItem(COURSE_CACHE_KEY);
      sessionStorage.removeItem(SCROLL_CACHE_KEY);
    }
  };

  // Clear cache when filters change to prevent stale data
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    
    // Don't clear cache if we're restoring from cache
    if (isFromCache) {
      return;
    }
    
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(COURSE_CACHE_KEY);
      sessionStorage.removeItem(SCROLL_CACHE_KEY);
    }
  }, [searchTerm, activeFilters, sortBy, isFromCache, hasInitialized]);

  // Handle screen size changes to adjust pagination
  useEffect(() => {
    let lastScreenType: string | null = null;
    
    const handleResize = () => {
      const currentScreenType = window.innerWidth < 768 ? 'mobile' : 'desktop';
      
      if (lastScreenType && lastScreenType !== currentScreenType) {
        // Screen type changed, clear cache to get appropriate page size
        sessionStorage.removeItem(COURSE_CACHE_KEY);
        sessionStorage.removeItem(SCROLL_CACHE_KEY);
        
        // Refetch with new page size if courses are loaded
        if (courses.length > 0 && !loading) {
          setCurrentPage(1);
          fetchCourses(1);
        }
      }
      
      lastScreenType = currentScreenType;
    };

    if (typeof window !== "undefined") {
      // Set initial screen type
      lastScreenType = window.innerWidth < 768 ? 'mobile' : 'desktop';
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [courses.length, loading, fetchCourses]);

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
            {courses.length > 0 && (
              <p className="text-left text-sm text-muted-foreground mb-6 ml-1">
                {language === "mm"
                  ? t("home.courses.showing").replace(
                      "{showing}",
                      convertToMyanmarNumber(courses.length)
                    ).replace(
                      "{total}",
                      convertToMyanmarNumber(totalCount)
                    )
                  : `Showing ${courses.length} of ${totalCount} ${
                      totalCount === 1 ? "course" : "courses"
                    }`}
              </p>
            )}

            {/* Course grid */}
            {loading && courses.length === 0 ? (
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
            ) : courses.length > 0 ? (
              <>
                <div className="course-grid-flex">
                  {courses.map((course, index) => (
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
                        startDate={
                          course.startDate ? formatDate(course.startDate) : ""
                        }
                        duration={course.duration}
                        durationUnit={course.durationUnit}
                        applyByDate={
                          course.applyByDate
                            ? formatDate(course.applyByDate)
                            : undefined
                        }
                        estimatedDate={course.estimatedDate}
                        fee={
                          course.feeAmount !== -1
                            ? formatFee(course.feeAmount)
                            : undefined
                        }
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

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loadingMore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t("home.loading")}
                        </div>
                      ) : (
                        t("home.load.more")
                      )}
                    </button>
                  </div>
                )}
              </>
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

      {/* Footer with navigation links */}
      <footer className="bg-gray-100 py-8 mt-8">
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
