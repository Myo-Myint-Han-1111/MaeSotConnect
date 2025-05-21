// src/app/api/courses/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch courses with the updated schema fields
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        titleMm: true,
        subtitle: true,
        subtitleMm: true,
        // location/locationMm fields no longer exist in the schema
        startDate: true,
        startDateMm: true,
        endDate: true, // New field
        endDateMm: true, // New field
        duration: true,
        durationMm: true,
        schedule: true,
        scheduleMm: true,
        // fee/feeMm fields are replaced with feeAmount/feeAmountMm
        feeAmount: true, // New field
        feeAmountMm: true, // New field
        ageMin: true, // New field
        ageMinMm: true, // New field
        ageMax: true, // New field
        ageMaxMm: true, // New field
        document: true, // New field
        documentMm: true, // New field
        availableDays: true,
        description: true,
        descriptionMm: true,
        outcomes: true,
        outcomesMm: true,
        scheduleDetails: true,
        scheduleDetailsMm: true,
        selectionCriteria: true,
        selectionCriteriaMm: true,
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
            district: true, // New field
            province: true, // New field
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
        faq: {
          select: {
            question: true,
            questionMm: true,
            answer: true,
            answerMm: true,
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
      endDate: course.endDate.toISOString(),
      endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
      // Add empty location fields for backward compatibility
      location: "",
      locationMm: null,
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
