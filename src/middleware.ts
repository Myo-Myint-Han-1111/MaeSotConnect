import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  // const path = nextUrl.pathname;

  // If not authenticated, redirect to signin
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Since we're only using PLATFORM_ADMIN role now, check if user has that role
  if (auth.user.role !== Role.PLATFORM_ADMIN) {
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
