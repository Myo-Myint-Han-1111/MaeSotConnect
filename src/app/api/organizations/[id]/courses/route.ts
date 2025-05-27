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

    // Format data to match the expected structure, handling the new schema
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      titleMm: course.titleMm,
      subtitle: course.subtitle,
      subtitleMm: course.subtitleMm,
      // Format dates as ISO strings
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm?.toISOString(),
      endDate: course.endDate.toISOString(),
      endDateMm: course.endDateMm?.toISOString(),
      // Convert duration numbers to strings for backwards compatibility
      duration: course.duration.toString(),
      durationMm: course.durationMm?.toString(),
      schedule: course.schedule,
      scheduleMm: course.scheduleMm,
      // Format fee information
      fee: course.feeAmount.toString(),
      feeMm: course.feeAmountMm ? course.feeAmountMm.toString() : null,
      // Age range
      ageMin: course.ageMin,
      ageMinMm: course.ageMinMm,
      ageMax: course.ageMax,
      ageMaxMm: course.ageMaxMm,
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
