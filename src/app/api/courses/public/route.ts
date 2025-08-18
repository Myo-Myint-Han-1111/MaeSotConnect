// src/app/api/courses/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Fetch courses with only fields needed for CourseCard component
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        titleMm: true,
        startDate: true,
        startDateMm: true,
        duration: true,
        durationMm: true,
        province: true,
        district: true,
        applyByDate: true,
        applyByDateMm: true,
        startByDate: true,
        startByDateMm: true,
        // fee/feeMm fields are replaced with feeAmount/feeAmountMm
        feeAmount: true,
        feeAmountMm: true,
        estimatedDate: true,
        estimatedDateMm: true,
        createdAt: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            advocateProfile: {
              select: {
                publicName: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        organizationInfo: {
          select: {
            id: true,
            name: true,
            description: true,
            phone: true,
            email: true,
            address: true,
            facebookPage: true,
            latitude: true,
            longitude: true,
            district: true,
            province: true,
            logoImage: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            courseId: true,
          },
        },
        badges: {
          select: {
            id: true,
            text: true,
            color: true,
            backgroundColor: true,
            courseId: true,
          },
        },
      },
    });

    // Format the response to ensure dates are serialized properly
    // and to maintain backward compatibility
    const formattedCourses = courses.map((course) => ({
      ...course,
      // Convert DateTime objects to ISO strings
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
      applyByDate: course.applyByDate ? course.applyByDate.toISOString() : null,
      applyByDateMm: course.applyByDateMm
        ? course.applyByDateMm.toISOString()
        : null,
      startByDate: course.startByDate ? course.startByDate.toISOString() : null,
      startByDateMm: course.startByDateMm
        ? course.startByDateMm.toISOString()
        : null,
      estimatedDate: course.estimatedDate,
      estimatedDateMm: course.estimatedDateMm,
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      // Build location from course district/province only
      location:
        [course.district, course.province].filter(Boolean).join(", ") || "",
      locationMm: null, // Keep for backward compatibility
      // Add empty fee fields for backward compatibility
      fee: course.feeAmount ? course.feeAmount.toString() : "",
      feeMm: course.feeAmountMm ? course.feeAmountMm.toString() : null,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
