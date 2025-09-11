import { NextResponse } from 'next/server';

export async function GET() {
  const robotsContent = `User-agent: *
Allow: /

# Block private/admin areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /advocate/
Disallow: /org-admin/
Disallow: /auth/

# Block API endpoints
Disallow: /api/

# Sitemap location
Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://jumpstudy.org'}/sitemap.xml`;

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}