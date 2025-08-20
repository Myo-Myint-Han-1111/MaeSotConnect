import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdvocateRoute = pathname.startsWith("/advocate");
  const isOrgAdminRoute = pathname.startsWith("/org-admin");

  // Check if it's a protected route
  if (isAdminRoute || isDashboardRoute || isAdvocateRoute || isOrgAdminRoute) {
    // Check for auth token in cookies
    // Note: In development, it's 'authjs.session-token'
    // In production with HTTPS, it's '__Secure-authjs.session-token'
    const token =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token") ||
      request.cookies.get("__Host-authjs.session-token"); // Some hosting providers

    if (!token) {
      // Preserve the original URL they were trying to access
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Add security headers for API routes
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();

    // Basic security headers (free)
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/admin/:path*",
    "/advocate/:path*",
    "/org-admin/:path*",
    // API routes for security headers
    "/api/:path*",
    // Exclude static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
