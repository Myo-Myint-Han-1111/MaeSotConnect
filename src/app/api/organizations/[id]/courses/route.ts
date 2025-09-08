// src/app/api/organizations/[id]/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to be resolved in Next.js 15
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can access organization courses
    if (session.user.role !== "PLATFORM_ADMIN") {
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
      titleMm: course.titleMm,
      subtitle: course.subtitle,
      subtitleMm: course.subtitleMm,
      // Format dates as ISO strings
      startDate: course.startDate.toISOString(),
      endDate: course.endDate.toISOString(),
      startByDate: course.startByDate ? course.startByDate.toISOString() : null,
      // Convert duration numbers to strings for backwards compatibility
      duration: course.duration.toString(),
      schedule: course.schedule,
      scheduleMm: course.scheduleMm,
      // Format fee information
      fee: course.feeAmount.toString(),
      // Age range
      ageMin: course.ageMin,
      ageMinMm: null,
      ageMax: course.ageMax,
      ageMaxMm: null,
      // Document requirements
      document: course.document,
      documentMm: course.documentMm,
      province: course.province,
      district: course.district,
      availableDays: course.availableDays,
      description: course.description,
      descriptionMm: course.descriptionMm,
      outcomes: course.outcomes,
      outcomesMm: course.outcomesMm,
      scheduleDetails: course.scheduleDetails,
      scheduleDetailsMm: course.scheduleDetailsMm,
      selectionCriteria: course.selectionCriteria,
      selectionCriteriaMm: course.selectionCriteriaMm,
      organizationId: course.organizationId,
      images: course.images.map((img) => img.url),
      badges: course.badges.map((badge) => ({
        text: badge.text,
        color: badge.color,
        backgroundColor: badge.backgroundColor,
      })),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
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
