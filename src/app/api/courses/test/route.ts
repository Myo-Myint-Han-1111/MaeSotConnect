// Create this file: src/app/api/courses/test/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Simple query - just basic course fields, no joins
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        subtitle: true,
        startDate: true,
        endDate: true,
        feeAmount: true,
      },
      take: 5, // Only get first 5 courses
    });

    console.log("Found courses:", courses.length);

    // Simple formatting - no complex processing
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      startDate: course.startDate.toISOString(),
      endDate: course.endDate.toISOString(),
      fee: course.feeAmount.toString(),
    }));

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json(
      {
        error: "Test API failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
