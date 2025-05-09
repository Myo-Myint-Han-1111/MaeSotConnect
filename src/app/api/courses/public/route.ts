// src/app/api/courses/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // in /api/courses/public/route.ts
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        titleMm: true,
        subtitle: true,
        subtitleMm: true,
        location: true,
        locationMm: true,
        startDate: true,
        startDateMm: true,
        duration: true,
        durationMm: true,
        schedule: true,
        scheduleMm: true,
        fee: true,
        feeMm: true,
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
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
