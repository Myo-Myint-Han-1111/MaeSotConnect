/**
 * Image display configuration for Next.js Image components
 * 
 * Returns props that bypass Vercel's image optimization since all images
 * are pre-compressed at upload time to optimal sizes (~100KB).
 * 
 * This approach:
 * - Eliminates Fast Origin Transfer costs from image processing
 * - Serves images directly from Supabase storage
 * - Maintains consistent quality across all environments
 * 
 * @returns Next.js Image component props
 */
export const getImageProps = () => {
  return {
    unoptimized: true, // Bypass Next.js/Vercel image optimization
    quality: undefined,
    sizes: "(max-width: 480px) 100vw, (max-width: 768px) 50vw, 384px"
  };
};