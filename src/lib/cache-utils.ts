/**
 * Cache utilities for development and production environments
 */

/**
 * Fetch with modern caching strategy for admin and dashboard pages
 * Uses no-store to prevent caching for real-time data
 */
export async function fetchWithNoCache(
  url: string, 
  options?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...options,
    cache: 'no-store'
  });
}

/**
 * Cache control headers for different environments
 */
export const getCacheHeaders = () => {
  if (process.env.NODE_ENV === "development") {
    return {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    };
  }
  
  return {
    "Cache-Control": "private, max-age=60, must-revalidate",
  };
};