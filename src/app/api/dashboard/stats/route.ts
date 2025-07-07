import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

// Type assertion for session user with organizationId
interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Type assertion to access organizationId
    const user = session.user as SessionUser;
    const isPlatformAdmin = user.role === "PLATFORM_ADMIN";
    const organizationId = user.organizationId;

    // Platform admin gets stats for the entire system
    if (isPlatformAdmin) {
      const [organizationsCount, coursesCount, usersCount] = await Promise.all([
        prisma.organization.count(),
        prisma.course.count(),
        prisma.user.count(),
      ]);

      return NextResponse.json({
        organizations: organizationsCount,
        courses: coursesCount,
        users: usersCount,
      });
    }
    // Organization admin gets stats only for their organization
    else if (organizationId) {
      const [coursesCount, usersCount] = await Promise.all([
        prisma.course.count({
          where: { organizationId },
        }),
        prisma.user.count({
          where: { organizationId },
        }),
      ]);

      return NextResponse.json({
        organizations: 1, // Only their own organization
        courses: coursesCount,
        users: usersCount,
      });
    } else {
      return NextResponse.json({
        organizations: 0,
        courses: 0,
        users: 0,
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
