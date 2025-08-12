import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes and their access levels
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdvocateRoute = pathname.startsWith('/advocate');
  
  // Check if it's a protected route
  if (isAdminRoute || isDashboardRoute || isAdvocateRoute) {
    // Check for auth token in cookies
    const token = request.cookies.get('authjs.session-token') || 
                  request.cookies.get('__Secure-authjs.session-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // Additional authorization checks will be handled at the page level
    // since we need to decode the JWT to check roles, which is better done
    // server-side in page components using auth()
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/advocate/:path*"],
};