import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;

  // If not authenticated, redirect to signin
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Check if user has PLATFORM_ADMIN role (using string comparison instead of enum)
  if (auth.user.role !== "PLATFORM_ADMIN") {
    // If not a platform admin, redirect to signin page
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Allow access to all protected routes for PLATFORM_ADMIN
  return NextResponse.next();
});

// Specify which routes to apply this middleware to
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};