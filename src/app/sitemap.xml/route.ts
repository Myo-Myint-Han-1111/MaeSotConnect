import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jumpstudy.org';
    
    // Get all published courses with their slugs
    const courses = await prisma.course.findMany({
      where: {
        // Only include courses that are visible to public
        startDate: {
          gte: new Date(), // Future courses only, as per public API
        },
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
        startDate: true,
        organizationInfo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Define static pages with their priorities and change frequencies
    const staticPages = [
      {
        url: '',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        url: 'courses',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        url: 'about',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        url: 'youthadvocates',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      },
    ];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
  ${courses
    .map(
      (course) => `
  <url>
    <loc>${baseUrl}/courses/${course.slug}</loc>
    <lastmod>${(course.createdAt || course.startDate).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`.trim();

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300', // 1 hour cache, 5 min stale
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );
  }
}