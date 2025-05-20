// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";

// Input validation schema
const courseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  titleMm: z.string().optional(),
  subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
  subtitleMm: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  locationMm: z.string().optional(),
  startDate: z.string().min(2, "Start date must be at least 2 characters"),
  startDateMm: z.string().optional(),
  duration: z.string().min(2, "Duration must be at least 2 characters"),
  durationMm: z.string().optional(),
  schedule: z.string().min(2, "Schedule must be at least 2 characters"),
  scheduleMm: z.string().optional(),
  fee: z.string().optional(),
  feeMm: z.string().optional(),
  availableDays: z.array(z.boolean()).length(7, "Must provide 7 days"),
  description: z.string().optional(),
  descriptionMm: z.string().optional(),
  outcomes: z.array(z.string()),
  outcomesMm: z.array(z.string()).optional(),
  scheduleDetails: z.string().optional(),
  scheduleDetailsMm: z.string().optional(),
  selectionCriteria: z.array(z.string()),
  selectionCriteriaMm: z.array(z.string()).optional(),
  organizationId: z.string(),
  badges: z.array(
    z.object({
      text: z.string(),
      color: z.string(),
      backgroundColor: z.string(),
    })
  ),
  faq: z.array(
    z.object({
      question: z.string(),
      questionMm: z.string().optional(),
      answer: z.string(),
      answerMm: z.string().optional(),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // If platform admin, return all courses
    if (session.user.role === "PLATFORM_ADMIN") {
      const courses = await prisma.course.findMany({
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
        location: course.location,
        locationMm: course.locationMm,
        startDate: course.startDate,
        startDateMm: course.startDateMm,
        duration: course.duration,
        durationMm: course.durationMm,
        schedule: course.schedule,
        scheduleMm: course.scheduleMm,
        fee: course.fee,
        feeMm: course.feeMm,
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
      }));

      return NextResponse.json(formattedCourses);
    }
    // If organization admin, return only their courses
    else if (
      session.user.role === "ORGANIZATION_ADMIN" &&
      session.user.organizationId
    ) {
      const courses = await prisma.course.findMany({
        where: { organizationId: session.user.organizationId },
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
        location: course.location,
        locationMm: course.locationMm,
        startDate: course.startDate,
        startDateMm: course.startDateMm,
        duration: course.duration,
        durationMm: course.durationMm,
        schedule: course.schedule,
        scheduleMm: course.scheduleMm,
        fee: course.fee,
        feeMm: course.feeMm,
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
      }));

      return NextResponse.json(formattedCourses);
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Must be platform admin or organization admin
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        !session.user.organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const jsonData = formData.get("data");

    if (!jsonData || typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // Parse and validate the JSON data
    const parsedData = JSON.parse(jsonData);
    const validationResult = courseSchema.safeParse(parsedData);

    if (!parsedData.organizationId || parsedData.organizationId === "") {
      parsedData.organizationId = null;
    }

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Organization admins can only create courses for their own organization
    if (
      session.user.role === "ORGANIZATION_ADMIN" &&
      session.user.organizationId !== parsedData.organizationId
    ) {
      return NextResponse.json(
        { error: "You can only create courses for your own organization" },
        { status: 403 }
      );
    }

    // Process and save image files
    const imageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        const imageUrl = await saveFile(value);
        imageUrls.push(imageUrl);
      }
    }

    // Create the course with all related entities in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // Create the course - NOW WITH MYANMAR FIELDS
      const newCourse = await tx.course.create({
        data: {
          title: parsedData.title,
          titleMm: parsedData.titleMm,
          subtitle: parsedData.subtitle,
          subtitleMm: parsedData.subtitleMm,
          location: parsedData.location,
          locationMm: parsedData.locationMm,
          startDate: parsedData.startDate,
          startDateMm: parsedData.startDateMm,
          duration: parsedData.duration,
          durationMm: parsedData.durationMm,
          schedule: parsedData.schedule,
          scheduleMm: parsedData.scheduleMm,
          fee: parsedData.fee,
          feeMm: parsedData.feeMm,
          availableDays: parsedData.availableDays,
          description: parsedData.description,
          descriptionMm: parsedData.descriptionMm,
          outcomes: parsedData.outcomes,
          outcomesMm: parsedData.outcomesMm || [],
          scheduleDetails: parsedData.scheduleDetails,
          scheduleDetailsMm: parsedData.scheduleDetailsMm,
          selectionCriteria: parsedData.selectionCriteria,
          selectionCriteriaMm: parsedData.selectionCriteriaMm || [],
          organizationId: parsedData.organizationId || null,
        },
      });

      // Create images
      for (const imageUrl of imageUrls) {
        await tx.image.create({
          data: {
            url: imageUrl,
            courseId: newCourse.id,
          },
        });
      }

      // Create badges
      for (const badge of parsedData.badges) {
        await tx.badge.create({
          data: {
            text: badge.text,
            color: badge.color,
            backgroundColor: badge.backgroundColor,
            courseId: newCourse.id,
          },
        });
      }

      // Create FAQs - NOW WITH MYANMAR FIELDS
      for (const faq of parsedData.faq) {
        if (faq.question && faq.answer) {
          await tx.fAQ.create({
            data: {
              question: faq.question,
              questionMm: faq.questionMm,
              answer: faq.answer,
              answerMm: faq.answerMm,
              courseId: newCourse.id,
            },
          });
        }
      }

      return newCourse;
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
