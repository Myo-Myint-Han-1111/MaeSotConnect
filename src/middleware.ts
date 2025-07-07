import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if it's a protected route
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Check for auth token in cookies
    const token = request.cookies.get('authjs.session-token') || 
                  request.cookies.get('__Secure-authjs.session-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};