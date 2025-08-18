export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  file: File;
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    maxSizeKB = 500
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
              type: 'image/jpeg',
              lastModified: file.lastModified 
            });
            compressImage(newFile, { ...options, quality: Math.max(0.1, quality - 0.1) })
              .then(resolve)
              .catch(reject);
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
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
        'image/jpeg',
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
  maxSizeKB: number = 200
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
              type: 'image/jpeg',
              lastModified: file.lastModified 
            });
            compressAvatarImage(newFile, size, Math.max(0.1, quality - 0.1), maxSizeKB)
              .then(resolve)
              .catch(reject);
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
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
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function shouldSkipOptimization(file: File): boolean {
  // Skip optimization for small files (under 10KB) as recommended by Vercel
  const smallFileThreshold = 10 * 1024; // 10KB
  
  // Skip optimization for SVG files (vector images)
  if (file.type === 'image/svg+xml') {
    return true;
  }
  
  // Skip optimization for GIF files (animated images)
  if (file.type === 'image/gif') {
    return true;
  }
  
  // Skip optimization for very small files
  if (file.size < smallFileThreshold) {
    return true;
  }
  
  return false;
}