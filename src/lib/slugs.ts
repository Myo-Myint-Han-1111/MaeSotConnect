// src/lib/slugs.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove non-English characters and special symbols
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

export function generateCourseSlug(
  courseTitle: string, 
  organizationName?: string,
  courseId?: string
): string {
  const titleSlug = generateSlug(courseTitle);
  const orgSlug = organizationName ? generateSlug(organizationName) : null;
  
  // Include last 6 characters of ID for uniqueness
  const shortId = courseId ? courseId.slice(-6) : '';
  
  if (orgSlug) {
    return `${orgSlug}/${titleSlug}-${shortId}`;
  }
  
  return `${titleSlug}-${shortId}`;
}

export function generateOrganizationSlug(name: string, id?: string): string {
  const baseSlug = generateSlug(name);
  const shortId = id ? id.slice(-6) : '';
  
  return shortId ? `${baseSlug}-${shortId}` : baseSlug;
}

export function parseCourseSlug(slug: string): { 
  courseId: string | null;
  organizationSlug?: string;
  courseSlug: string;
  fullSlug: string;
} {
  const parts = slug.split('/');
  
  if (parts.length === 2) {
    // Format: org-slug/course-title-id123
    const [orgSlug, courseWithId] = parts;
    const lastDashIndex = courseWithId.lastIndexOf('-');
    
    if (lastDashIndex === -1) {
      return { courseId: null, courseSlug: courseWithId, fullSlug: slug };
    }
    
    const courseId = courseWithId.slice(lastDashIndex + 1);
    const courseSlug = courseWithId.slice(0, lastDashIndex);
    
    return {
      courseId,
      organizationSlug: orgSlug,
      courseSlug,
      fullSlug: slug
    };
  } else {
    // Format: course-title-id123
    const lastDashIndex = slug.lastIndexOf('-');
    
    if (lastDashIndex === -1) {
      return { courseId: null, courseSlug: slug, fullSlug: slug };
    }
    
    const courseId = slug.slice(lastDashIndex + 1);
    const courseSlug = slug.slice(0, lastDashIndex);
    
    return {
      courseId,
      courseSlug,
      fullSlug: slug
    };
  }
}

// Helper function to ensure slug uniqueness
export async function ensureUniqueSlug(
  baseSlug: string,
  checkFunction: (slug: string) => Promise<boolean>
): Promise<string> {
  let finalSlug = baseSlug;
  let counter = 1;
  
  while (await checkFunction(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
}