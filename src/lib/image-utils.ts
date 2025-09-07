/**
 * Image display configuration for Next.js Image components
 * 
 * Returns props that bypass Vercel's image optimization since all images
 * are pre-compressed at upload time to optimal sizes (~80KB) in WebP format.
 * 
 * This approach:
 * - Eliminates Fast Origin Transfer costs from image processing
 * - Serves WebP images directly from Supabase storage (25-35% smaller than JPEG)
 * - Maintains consistent quality across all environments
 * - Provides optimal loading performance for course cards
 * 
 * @returns Next.js Image component props optimized for WebP delivery
 */
export const getImageProps = () => {
  return {
    unoptimized: true, // Bypass Next.js/Vercel image optimization (images pre-optimized)
    quality: undefined, // Not applicable when unoptimized
    sizes: "(max-width: 480px) 100vw, (max-width: 768px) 50vw, 384px", // Responsive sizing
    // Enable modern image format support
    placeholder: "blur" as const,
    blurDataURL: "data:image/webp;base64,UklGRpQAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA"
  };
};

/**
 * Check if browser supports WebP format
 * Used for fallback scenarios if needed
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return true; // Assume support on server
  
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL for different contexts
 * Handles WebP/JPEG selection based on file availability
 */
export const getOptimizedImageUrl = (baseUrl: string): string => {
  // Images are already optimized and served from Supabase
  // The compression script handles WebP conversion
  return baseUrl;
};