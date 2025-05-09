import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If not authenticated or no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Access control for admin routes
    if (path.startsWith("/admin")) {
      if (token.role !== Role.PLATFORM_ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Access control for organization admin routes
    if (path.startsWith("/organization")) {
      if (
        token.role !== Role.ORGANIZATION_ADMIN &&
        token.role !== Role.PLATFORM_ADMIN
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes to apply this middleware to
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/organization/:path*"],
};
