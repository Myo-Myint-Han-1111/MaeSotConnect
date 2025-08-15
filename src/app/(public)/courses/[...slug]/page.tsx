import { Metadata } from "next";
import CourseClientPage from "./CourseClientPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const currentSlug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug.join("/") : resolvedParams.slug;
  
  try {
    // Fetch course data for metadata generation
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/courses/${encodeURIComponent(currentSlug)}`, {
      cache: 'no-store' // Ensure fresh data for metadata
    });
    
    if (!response.ok) {
      return {
        title: "Course Not Found",
        description: "The requested course could not be found."
      };
    }

    const course = await response.json();
    
    return {
      title: course.title,
      description: course.description || course.subtitle || `Learn about ${course.title} at ${course.organizationInfo?.name || 'our organization'}`,
      openGraph: {
        title: course.title,
        description: course.description || course.subtitle,
        images: course.images?.length > 0 ? [course.images[0]] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Course Details",
      description: "View course information and details"
    };
  }
}

export default function CoursePage() {
  return <CourseClientPage />;
}