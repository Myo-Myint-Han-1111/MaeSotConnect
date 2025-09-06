"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { CourseCard } from '@/components/CourseCard/CourseCard';
import { useInfiniteCourses } from '@/hooks/useInfiniteCourses';
import { useLanguage } from '@/context/LanguageContext';
import { convertToMyanmarNumber } from '@/lib/utils';
import { getFontSizeClasses } from '@/lib/font-sizes';

interface Course {
  id: string;
  slug: string;
  title: string;
  titleMm: string | null;
  startDate: string;
  startDateMm: string | null;
  applyByDate?: string | null;
  applyByDateMm?: string | null;
  startByDate?: string | null;
  startByDateMm?: string | null;
  estimatedDate?: string | null;
  estimatedDateMm?: string | null;
  duration: number;
  durationMm: number | null;
  feeAmount?: number;
  feeAmountMm?: number | null;
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

interface VirtualizedCourseGridProps {
  searchTerm: string;
  activeFilters: string[];
  sortBy: string;
}

// Cache constants for position preservation
const VIRTUOSO_CACHE_KEY = "virtuosoCourseCache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface VirtuosoState {
  scrollTop: number;
  searchTerm: string;
  activeFilters: string[];
  sortBy: string;
  targetSlug?: string;
  timestamp: number;
}

export function VirtualizedCourseGrid({
  searchTerm,
  activeFilters,
  sortBy,
}: VirtualizedCourseGridProps) {
  const { t, language } = useLanguage();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  
  const {
    courses,
    loading,
    hasMore,
    error,
    loadMore,
    totalCount,
  } = useInfiniteCourses({
    searchTerm,
    activeFilters,
    sortBy,
  });

  // Format date for display (convert from ISO string to localized format)
  const formatDate = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "mm" ? "my-MM" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [language]);

  const formatFee = useCallback((amount: number | undefined): string | null => {
    if (amount === -1 || amount === undefined) return null;
    if (amount === 0) return "Free";
    return `฿${amount.toLocaleString()}`;
  }, []);

  // Format functions (same as original)
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
      } else if (duration >= 365) {
        const years = duration / 365;
        const formattedYears =
          years % 1 === 0 ? years.toString() : years.toFixed(1);
        return `${formattedYears} ${language === "mm" ? "နှစ်" : "year"}`;
      } else {
        const months = duration / 30.44;
        const formattedMonths =
          months % 1 < 0.1 || months % 1 > 0.9
            ? Math.round(months).toString()
            : months.toFixed(1);

        return `${formattedMonths} ${language === "mm" ? "လ" : "month"}`;
      }
    },
    [language]
  );

  // Grid layout calculation for responsive design - optimized for mobile
  const getItemsPerRow = useCallback(() => {
    // These breakpoints match your existing CSS grid, but prioritize mobile performance
    const width = window.innerWidth;
    if (width >= 1536) return 4; // 2xl - desktop
    if (width >= 1280) return 3; // xl - desktop  
    if (width >= 1024) return 3; // lg - tablet landscape
    if (width >= 768) return 2;  // md - tablet portrait
    return 1; // mobile - single column for best performance
  }, []);

  const [itemsPerRow, setItemsPerRow] = useState(() => 
    typeof window !== 'undefined' ? getItemsPerRow() : 1
  );

  // Create rows for virtualization
  const courseRows = useMemo(() => {
    const rows: Course[][] = [];
    for (let i = 0; i < courses.length; i += itemsPerRow) {
      rows.push(courses.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [courses, itemsPerRow]);

  // Position preservation functions
  const saveScrollPosition = useCallback(() => {
    if (typeof window === "undefined" || !virtuosoRef.current) return;

    try {
      virtuosoRef.current.getState((state) => {
        const cacheData: VirtuosoState = {
          scrollTop: state.scrollTop || 0,
          searchTerm,
          activeFilters,
          sortBy,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(VIRTUOSO_CACHE_KEY, JSON.stringify(cacheData));
      });
    } catch (error) {
      console.error("Error saving scroll position:", error);
    }
  }, [searchTerm, activeFilters, sortBy]);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window === "undefined" || !virtuosoRef.current || isScrollRestored) return;

    try {
      // Check for target course slug first (from legacy navigation)
      const targetSlug = sessionStorage.getItem("targetCourseSlug");
      if (targetSlug && courses.length > 0) {
        // Find the course in the current data
        const flatCourses = courseRows.flat();
        const targetIndex = flatCourses.findIndex(course => course.slug === targetSlug);
        
        if (targetIndex !== -1) {
          const rowIndex = Math.floor(targetIndex / itemsPerRow);
          virtuosoRef.current.scrollToIndex({ index: rowIndex, behavior: 'auto' });
          sessionStorage.removeItem("targetCourseSlug");
          setIsScrollRestored(true);
          return;
        }
      }

      // Try cached scroll position
      const cached = sessionStorage.getItem(VIRTUOSO_CACHE_KEY);
      if (!cached) return;

      const state: VirtuosoState = JSON.parse(cached);
      
      // Check if cache is still valid and matches current filters
      if (
        Date.now() - state.timestamp <= CACHE_DURATION &&
        state.searchTerm === searchTerm &&
        JSON.stringify(state.activeFilters) === JSON.stringify(activeFilters) &&
        state.sortBy === sortBy
      ) {
        virtuosoRef.current.scrollTo({ top: state.scrollTop, behavior: 'auto' });
        setIsScrollRestored(true);
      } else {
        sessionStorage.removeItem(VIRTUOSO_CACHE_KEY);
      }
    } catch (error) {
      console.error("Error restoring scroll position:", error);
      sessionStorage.removeItem(VIRTUOSO_CACHE_KEY);
    }
  }, [courseRows, itemsPerRow, searchTerm, activeFilters, sortBy, courses.length, isScrollRestored]);

  // Restore scroll position when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !loading) {
      // Small delay to ensure virtuoso is ready
      const timer = setTimeout(restoreScrollPosition, 100);
      return () => clearTimeout(timer);
    }
  }, [courses.length, loading, restoreScrollPosition]);

  // Save scroll position on scroll
  const handleScroll = useCallback(() => {
    if (!isScrollRestored) return; // Don't save during restoration
    
    // Debounce scroll position saving
    const timeoutId = setTimeout(saveScrollPosition, 500);
    return () => clearTimeout(timeoutId);
  }, [saveScrollPosition, isScrollRestored]);

  // Save position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveScrollPosition]);

  // Handle window resize
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setItemsPerRow(getItemsPerRow());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getItemsPerRow]);

  // Item renderer for Virtuoso
  const renderRow = useCallback((index: number, row: Course[]) => {
    return (
      <div 
        key={`row-${index}`}
        className="course-grid-flex-row mb-6"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
          gap: itemsPerRow === 1 ? '1rem' : '1.5rem', // Smaller gap on mobile
          padding: itemsPerRow === 1 ? '0 0.5rem' : '0 1rem', // Less padding on mobile
        }}
      >
        {row.map((course, colIndex) => (
          <div
            key={course.id}
            className="course-card-flex"
            data-course-slug={course.slug}
          >
            <CourseCard
              slug={course.slug}
              images={course.images}
              title={course.title}
              titleMm={course.titleMm || null}
              startDate={formatDate(course.startDate)}
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
              duration={formatDuration(course.duration)}
              durationMm={
                course.durationMm
                  ? formatDuration(course.durationMm)
                  : null
              }
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
              estimatedDate={course.estimatedDate || null}
              estimatedDateMm={course.estimatedDateMm || null}
              fee={
                course.feeAmount !== -1
                  ? formatFee(course.feeAmount)
                  : undefined
              }
              feeMm={
                course.feeAmountMm ? formatFee(course.feeAmountMm) : null
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
              showSwipeHint={index === 0 && colIndex === 0}
            />
          </div>
        ))}
      </div>
    );
  }, [itemsPerRow, formatDuration, formatDate, formatFee]);

  // Loading footer component with future "Load Older Courses" placeholder
  const Footer = useCallback(() => {
    if (!hasMore && courses.length > 0) {
      return (
        <div className="text-center py-8 space-y-4">
          <div className="text-muted-foreground">
            {t("home.all.loaded")} ({totalCount} {totalCount === 1 ? t("home.course") : t("home.courses")})
          </div>
          
          {/* 
            TODO: Future implementation - Load Older Courses button
            When implemented, this should:
            1. Show courses that have already started or ended
            2. Modify the API to accept an "includeOld" parameter 
            3. Change the startDate filter from gte (>=) to lt (<) for old courses
            4. Append old courses to the bottom of the current list
            5. Maintain separate pagination for old courses
          */}
          <div className="opacity-50">
            <button 
              className="px-6 py-3 border border-dashed border-muted-foreground rounded-lg text-muted-foreground cursor-not-allowed"
              disabled
            >
              Load Older Courses (Coming Soon)
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">{t("home.loading")}</span>
        </div>
      );
    }

    return null;
  }, [hasMore, loading, courses.length, totalCount, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {t("home.retry")}
        </button>
      </div>
    );
  }

  if (courses.length === 0 && !loading) {
    return (
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
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      {totalCount > 0 && (
        <p className="text-left text-sm text-muted-foreground mb-6 ml-1">
          {language === "mm"
            ? totalCount === 1
              ? t("home.course.found").replace(
                  "{count}",
                  convertToMyanmarNumber(totalCount)
                )
              : t("home.courses.found").replace(
                  "{count}",
                  convertToMyanmarNumber(totalCount)
                )
            : `${totalCount} ${
                totalCount === 1
                  ? t("home.course.found")
                  : t("home.courses.found")
              }`}
        </p>
      )}

      {/* Virtualized course grid */}
      <div style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
        <Virtuoso
          ref={virtuosoRef}
          data={courseRows}
          endReached={loadMore}
          increaseViewportBy={itemsPerRow === 1 ? 200 : 400} // Lower pre-render for mobile
          itemContent={renderRow}
          components={{ Footer }}
          style={{ width: '100%', height: '100%' }}
          onScroll={handleScroll}
          overscan={itemsPerRow === 1 ? 2 : 5} // Fewer items buffered on mobile
        />
      </div>
    </>
  );
}