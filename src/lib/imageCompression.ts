/**
 * Client-side image compression utilities for upload optimization
 * 
 * Handles image resizing and compression in the browser using Canvas API
 * before uploading to Supabase storage. This prevents large files from
 * being uploaded and reduces storage/bandwidth costs.
 */

export interface CompressionOptions {
  maxWidth?: number;        // Maximum width in pixels
  maxHeight?: number;       // Maximum height in pixels  
  quality?: number;         // WebP quality (0.1 to 1.0)
  maxSizeKB?: number;       // Target maximum file size in KB
  format?: 'webp' | 'jpeg'; // Output format (defaults to WebP)
}

export interface CompressionResult {
  originalSize: number;     // Original file size in bytes
  compressedSize: number;   // Compressed file size in bytes
  compressionRatio: number; // originalSize / compressedSize
  file: File;              // Compressed File object
}

/**
 * Compresses an image file using Canvas API
 * 
 * Resizes the image to fit within maxWidth/maxHeight while maintaining
 * aspect ratio, then compresses to WebP format (default) for optimal compression.
 * If the result exceeds maxSizeKB, iteratively reduces quality until target is met.
 * 
 * @param file - Image file to compress
 * @param options - Compression parameters
 * @returns Promise resolving to compression result with optimized file
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 800,   // Optimized for course card display (~400px)
    maxHeight = 600,  // Maintain 4:3 aspect ratio  
    quality = 0.8,    // High quality baseline
    maxSizeKB = 80,   // Reduced target for WebP (smaller than JPEG)
    format = 'webp'   // Default to WebP for optimal compression
  } = options;

  const originalSize = file.size;

  // If file is already small enough, return as-is
  if (originalSize <= maxSizeKB * 1024) {
    return {
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      file
    };
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Unable to get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determine output format settings
      const outputType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      const fileExtension = format === 'webp' ? '.webp' : '.jpg';
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          
          // Check if we need further compression
          if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
            // Recursively compress with lower quality
            const newFile = new File([blob], file.name, { 
              type: outputType,
              lastModified: file.lastModified 
            });
            compressImage(newFile, { ...options, quality: Math.max(0.1, quality - 0.1) })
              .then(resolve)
              .catch(reject);
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, fileExtension), {
              type: outputType,
              lastModified: file.lastModified
            });
            
            resolve({
              originalSize,
              compressedSize: compressedFile.size,
              compressionRatio: originalSize / compressedFile.size,
              file: compressedFile
            });
          }
        },
        outputType,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateImageFile(file: File): string | null {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }
  
  // Check file size (max 50MB for original before compression)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }
  
  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return 'Supported formats: JPEG, PNG, WebP';
  }
  
  return null;
}

export async function compressAvatarImage(
  file: File,
  size: number = 400,
  quality: number = 0.8,
  maxSizeKB: number = 100,  // Reduced for WebP
  format: 'webp' | 'jpeg' = 'webp'  // Default to WebP
): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Unable to get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Create square canvas
      canvas.width = size;
      canvas.height = size;
      
      // Get original dimensions
      const { width: imgWidth, height: imgHeight } = img;
      
      // Calculate the size of the square crop (use the smaller dimension)
      const cropSize = Math.min(imgWidth, imgHeight);
      
      // Calculate crop position to center the crop
      const cropX = (imgWidth - cropSize) / 2;
      const cropY = (imgHeight - cropSize) / 2;
      
      // Draw cropped and scaled image to fill square canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw the center-cropped square portion of the image
      ctx.drawImage(
        img,
        cropX, cropY, cropSize, cropSize, // source: center square crop
        0, 0, size, size // destination: fill entire canvas
      );
      
      // Determine output format settings
      const outputType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      const fileExtension = format === 'webp' ? '.webp' : '.jpg';
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          
          // Check if we need further compression
          if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
            // Recursively compress with lower quality
            const newFile = new File([blob], file.name, { 
              type: outputType,
              lastModified: file.lastModified 
            });
            compressAvatarImage(newFile, size, Math.max(0.1, quality - 0.1), maxSizeKB, format)
              .then(resolve)
              .catch(reject);
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, fileExtension), {
              type: outputType,
              lastModified: file.lastModified
            });
            
            resolve({
              originalSize,
              compressedSize: compressedFile.size,
              compressionRatio: originalSize / compressedFile.size,
              file: compressedFile
            });
          }
        },
        outputType,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresses course images with optimized settings
 * 
 * Convenience function that applies course-specific compression settings:
 * - Sized for course card display (800x600 max)
 * - WebP format for optimal compression and quality (≤80KB target)
 * - High quality for professional appearance
 * 
 * @param file - Course image file to compress
 * @returns Promise resolving to compression result
 */
export async function compressCourseImage(
  file: File
): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 800,     // Optimal for course card display
    maxHeight: 600,    // Maintain aspect ratio
    quality: 0.8,      // High quality baseline
    maxSizeKB: 80,     // Optimized for WebP compression
    format: 'webp'     // Use WebP for best compression/quality ratio
  });
}

/**
 * Determines if a file should skip compression optimization
 * 
 * Skips compression for:
 * - Very small files (already optimized)
 * - SVG files (vector graphics, lossy compression inappropriate)
 * - GIF files (may contain animations)
 * 
 * @param file - File to evaluate
 * @returns true if compression should be skipped
 */
export function shouldSkipOptimization(file: File): boolean {
  const SMALL_FILE_THRESHOLD = 10 * 1024; // 10KB
  
  // Skip vector graphics - compression would degrade quality
  if (file.type === 'image/svg+xml') {
    return true;
  }
  
  // Skip animated images - may break animations
  if (file.type === 'image/gif') {
    return true;
  }
  
  // Skip already optimized small files
  if (file.size < SMALL_FILE_THRESHOLD) {
    return true;
  }
  
  return false;
}