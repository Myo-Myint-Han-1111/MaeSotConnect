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
        description: "The requested course could not be found.",
        robots: { index: false, follow: false }
      };
    }

    const course = await response.json();
    
    // Generate rich description
    const description = course.description || course.subtitle || 
      `Learn about ${course.title} at ${course.organizationInfo?.name || 'our organization'}. ` +
      (course.startDate ? `Starting ${new Date(course.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. ` : '') +
      (course.duration && course.durationUnit ? `Duration: ${course.duration} ${course.durationUnit}${course.duration > 1 ? 's' : ''}. ` : '') +
      (course.district && course.province ? `Location: ${course.district}, ${course.province}. ` : '') +
      (course.feeAmount !== undefined && course.feeAmount !== -1 ? 
        (course.feeAmount === 0 ? 'Free course. ' : `Fee: ฿${course.feeAmount.toLocaleString()}. `) : 
        '');

    // Generate keywords
    const keywords = [
      course.title,
      course.organizationInfo?.name,
      course.district,
      course.province,
      'Thailand education',
      'training program',
      'course',
      ...(course.badges?.map((b: { text: string }) => b.text) || [])
    ].filter(Boolean);

    return {
      title: `${course.title} | ${course.organizationInfo?.name || 'JumpStudy.org'}`,
      description: description.substring(0, 160), // Optimal length for search results
      keywords: keywords,
      
      openGraph: {
        title: course.title,
        description: description.substring(0, 300),
        type: 'article',
        publishedTime: course.createdAt,
        modifiedTime: course.updatedAt || course.createdAt,
        authors: [course.organizationInfo?.name || 'JumpStudy.org'],
        section: 'Education',
        tags: course.badges?.map((b: { text: string }) => b.text) || [],
        locale: 'en_US',
        siteName: 'JumpStudy.org',
        images: course.images?.length > 0 ? 
          [
            // Use actual course images first (Facebook loves real images)
            ...course.images.map((img: { url: string }) => ({
              url: img.url,
              width: 1200,
              height: 630,
              alt: `${course.title} - Course Image`,
              type: 'image/jpeg',
            })),
            // JumpStudy logo as fallback
            {
              url: '/images/JumpStudyLogo.svg',
              width: 1200,
              height: 630,
              alt: `${course.title} | JumpStudy.org`,
              type: 'image/svg+xml',
            }
          ] : 
          [{
            url: '/images/JumpStudyLogo.svg',
            width: 1200,
            height: 630,
            alt: `${course.title} | JumpStudy.org`,
            type: 'image/svg+xml',
          }],
      },
      
      twitter: {
        title: course.title,
        description: description.substring(0, 200),
        images: course.images?.length > 0 ? [course.images[0].url] : ['/images/JumpStudyLogo.svg'],
        creator: '@jumpstudy_org',
      },
      
      // Structured data for rich snippets
      other: Object.fromEntries(
        Object.entries({
          'article:author': course.organizationInfo?.name || 'JumpStudy.org',
          'article:published_time': course.createdAt,
          'article:modified_time': course.updatedAt || course.createdAt,
          'article:section': 'Education',
          'course:duration': course.duration && course.durationUnit ? `${course.duration} ${course.durationUnit}` : null,
          'course:location': course.district && course.province ? `${course.district}, ${course.province}` : null,
          'course:fee': course.feeAmount !== undefined && course.feeAmount !== -1 ? 
            (course.feeAmount === 0 ? 'Free' : `฿${course.feeAmount.toLocaleString()}`) : null,
          'course:start_date': course.startDate,
        }).filter(([, value]) => value != null)
      ),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Course Details",
      description: "View course information and details",
      robots: { index: false, follow: true }
    };
  }
}

export default function CoursePage() {
  return <CourseClientPage />;
}