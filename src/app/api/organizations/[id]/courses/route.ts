// src/app/api/organizations/[id]/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Check permissions - platform admin can access any, org admin only their own
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        session.user.organizationId !== id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get courses for this organization
    const courses = await prisma.course.findMany({
      where: { organizationId: id },
      include: {
        images: true,
        badges: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format data to match the expected structure
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      location: course.location,
      startDate: course.startDate,
      duration: course.duration,
      schedule: course.schedule,
      fee: course.fee,
      availableDays: course.availableDays,
      description: course.description,
      outcomes: course.outcomes,
      scheduleDetails: course.scheduleDetails,
      selectionCriteria: course.selectionCriteria,
      organizationId: course.organizationId,
      images: course.images.map((img) => img.url),
      badges: course.badges.map((badge) => ({
        text: badge.text,
        color: badge.color,
        backgroundColor: badge.backgroundColor,
      })),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Error fetching organization courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization courses" },
      { status: 500 }
    );
  }
}
