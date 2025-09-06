import { useState, useCallback, useEffect, useRef } from 'react';

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

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}

interface CourseResponse {
  courses: Course[];
  pagination: PaginationMeta;
}

interface UseInfiniteCoursesOptions {
  searchTerm?: string;
  activeFilters?: string[];
  sortBy?: string;
}

interface UseInfiniteCoursesReturn {
  courses: Course[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refetch: () => void;
  totalCount: number;
}

const COURSES_PER_PAGE = 24;

export function useInfiniteCourses({
  searchTerm = '',
  activeFilters = [],
  sortBy = 'startDate-asc'
}: UseInfiniteCoursesOptions = {}): UseInfiniteCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const isInitialFetchRef = useRef(false);

  // Create a stable reference for fetchCourses parameters
  const fetchParamsRef = useRef({ searchTerm, activeFilters, sortBy });
  useEffect(() => {
    fetchParamsRef.current = { searchTerm, activeFilters, sortBy };
  }, [searchTerm, activeFilters, sortBy]);

  // This function is only used for loading MORE pages, not initial load
  const fetchCourses = useCallback(async (page: number) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const { searchTerm: currentSearch, activeFilters: currentFilters, sortBy: currentSort } = fetchParamsRef.current;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: COURSES_PER_PAGE.toString(),
        sortBy: currentSort,
      });

      if (currentSearch) {
        params.append('search', currentSearch);
      }

      if (currentFilters.length > 0) {
        params.append('badges', currentFilters.join(','));
      }

      const response = await fetch(`/api/courses/public?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data: CourseResponse = await response.json();
      
      // Always append for pagination
      setCourses(prev => [...prev, ...data.courses]);
      setHasMore(data.pagination.hasMore);
      setTotalCount(data.pagination.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCourses(currentPage + 1);
    }
  }, [fetchCourses, currentPage, loading, hasMore]);

  const refetch = useCallback(() => {
    // This will trigger the useEffect above
    setCourses([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalCount(0);
  }, []);

  // Initial load and refetch when dependencies change
  useEffect(() => {
    // Prevent duplicate initial fetches
    if (isInitialFetchRef.current) {
      isInitialFetchRef.current = false;
    }
    
    setCourses([]);
    setCurrentPage(1);
    setHasMore(true);
    
    // Call fetch directly to avoid dependency loop
    const controller = new AbortController();
    
    const doFetch = async () => {
      if (isInitialFetchRef.current) return;
      isInitialFetchRef.current = true;
      
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: '1',
          limit: COURSES_PER_PAGE.toString(),
          sortBy,
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        if (activeFilters.length > 0) {
          params.append('badges', activeFilters.join(','));
        }

        const response = await fetch(`/api/courses/public?${params.toString()}`, {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data: CourseResponse = await response.json();
        
        if (!controller.signal.aborted) {
          setCourses(data.courses);
          setHasMore(data.pagination.hasMore);
          setTotalCount(data.pagination.total);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching courses:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          isInitialFetchRef.current = false;
        }
      }
    };

    doFetch();

    return () => controller.abort();
  }, [searchTerm, activeFilters, sortBy]); // Remove fetchCourses dependency

  return {
    courses,
    loading,
    hasMore,
    error,
    loadMore,
    refetch,
    totalCount,
  };
}