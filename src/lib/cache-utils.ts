/**
 * Cache utilities for development and production environments
 */

/**
 * Adds cache-busting parameters to URLs in development mode
 * In production, returns the URL unchanged to allow proper caching
 */
export function addCacheBuster(url: string): string {
  if (process.env.NODE_ENV === "development") {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  }
  return url;
}

/**
 * Fetch with automatic cache busting in development
 */
export async function fetchWithCacheBusting(
  url: string, 
  options?: RequestInit
): Promise<Response> {
  return fetch(addCacheBuster(url), options);
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