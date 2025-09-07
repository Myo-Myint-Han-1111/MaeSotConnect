// app/api/org-admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Get all courses for this organization
    const courses = await prisma.course.findMany({
      where: { organizationId: user.organizationId },
      include: {
        images: true,
        badges: true,
        organizationInfo: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      titleMm: course.titleMm,
      subtitle: course.subtitle,
      subtitleMm: course.subtitleMm,
      startDate: course.startDate.toISOString(),
      endDate: course.endDate.toISOString(),
      duration: course.duration.toString(),
      durationUnit: course.durationUnit,
      durationUnitMm: course.durationUnitMm,
      schedule: course.schedule,
      feeAmount: course.feeAmount.toString(),
      province: course.province,
      district: course.district,
      address: course.address,
      slug: course.slug,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      images: course.images,
      badges: course.badges,
      organization: course.organizationInfo,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Error fetching organization courses:", error);
    return NextResponse.json(
      { error: "Faiwhatled to fetch courses" },
      { status: 500 }
    );
  }
}
