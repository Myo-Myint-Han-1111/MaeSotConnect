import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const path = nextUrl.pathname;

  // If not authenticated, redirect to signin
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Access control for admin routes
  if (path.startsWith("/admin")) {
    if (auth.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Access control for organization admin routes
  if (path.startsWith("/organization")) {
    if (
      auth.user.role !== Role.ORGANIZATION_ADMIN &&
      auth.user.role !== Role.PLATFORM_ADMIN
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

// Specify which routes to apply this middleware to
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/organization/:path*"],
};