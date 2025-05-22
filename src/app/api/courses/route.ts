// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";

// Update Zod schema to match the new Prisma schema
const courseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  titleMm: z.string().optional(),
  subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
  subtitleMm: z.string().optional(),
  // Location fields are removed in the schema but kept in the route for backward compatibility
  location: z.string().optional(),
  locationMm: z.string().optional(),
  // Modified date handling with explicit transformation
  startDate: z.string().transform((val) => new Date(val)),
  startDateMm: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z.string().transform((val) => new Date(val)),
  endDateMm: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  duration: z.number().int().positive(), // Changed from string to integer
  durationMm: z.number().int().positive().optional(),
  schedule: z.string().min(2, "Schedule must be at least 2 characters"),
  scheduleMm: z.string().optional(),
  feeAmount: z.number().int().nonnegative(), // Added .int()
  feeAmountMm: z.number().int().nonnegative().optional(), // Added .int()
  // Fee fields kept for backward compatibility
  fee: z.string().optional(),
  feeMm: z.string().optional(),
  ageMin: z.number().int().nonnegative(), // New field
  ageMinMm: z.number().int().nonnegative().optional(), // New field
  ageMax: z.number().int().positive(), // New field
  ageMaxMm: z.number().int().positive().optional(), // New field
  document: z.string(), // New field
  documentMm: z.string().optional(), // New field
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
        // Map date fields to strings for backward compatibility in the frontend
        startDate: course.startDate.toISOString(),
        startDateMm: course.startDateMm
          ? course.startDateMm.toISOString()
          : null,
        endDate: course.endDate.toISOString(),
        endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
        duration: course.duration,
        durationMm: course.durationMm,
        schedule: course.schedule,
        scheduleMm: course.scheduleMm,
        feeAmount: course.feeAmount,
        feeAmountMm: course.feeAmountMm,
        ageMin: course.ageMin,
        ageMinMm: course.ageMinMm,
        ageMax: course.ageMax,
        ageMaxMm: course.ageMaxMm,
        document: course.document,
        documentMm: course.documentMm,
        availableDays: course.availableDays,
        description: course.description,
        descriptionMm: course.descriptionMm,
        outcomes: course.outcomes,
        outcomesMm: course.outcomesMm || [],
        scheduleDetails: course.scheduleDetails,
        scheduleDetailsMm: course.scheduleDetailsMm,
        selectionCriteria: course.selectionCriteria,
        selectionCriteriaMm: course.selectionCriteriaMm || [],
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
        // Map date fields to strings for backward compatibility in the frontend
        startDate: course.startDate.toISOString(),
        startDateMm: course.startDateMm
          ? course.startDateMm.toISOString()
          : null,
        endDate: course.endDate.toISOString(),
        endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
        duration: course.duration,
        durationMm: course.durationMm,
        schedule: course.schedule,
        scheduleMm: course.scheduleMm,
        feeAmount: course.feeAmount,
        feeAmountMm: course.feeAmountMm,
        ageMin: course.ageMin,
        ageMinMm: course.ageMinMm,
        ageMax: course.ageMax,
        ageMaxMm: course.ageMaxMm,
        document: course.document,
        documentMm: course.documentMm,
        availableDays: course.availableDays,
        description: course.description,
        descriptionMm: course.descriptionMm,
        outcomes: course.outcomes,
        outcomesMm: course.outcomesMm || [],
        scheduleDetails: course.scheduleDetails,
        scheduleDetailsMm: course.scheduleDetailsMm,
        selectionCriteria: course.selectionCriteria,
        selectionCriteriaMm: course.selectionCriteriaMm || [],
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

// src/app/api/courses/route.ts - Updated POST function

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

    // IMPORTANT: Convert fee amounts to integers if they're not already
    if (parsedData.feeAmount !== undefined) {
      parsedData.feeAmount = Math.round(Number(parsedData.feeAmount));
    }
    if (parsedData.feeAmountMm !== undefined) {
      parsedData.feeAmountMm = Math.round(Number(parsedData.feeAmountMm));
    }

    // Ensure numeric fields are proper integers
    if (parsedData.duration !== undefined) {
      parsedData.duration = Math.round(Number(parsedData.duration));
    }
    if (parsedData.durationMm !== undefined) {
      parsedData.durationMm = Math.round(Number(parsedData.durationMm));
    }
    if (parsedData.ageMin !== undefined) {
      parsedData.ageMin = Math.round(Number(parsedData.ageMin));
    }
    if (parsedData.ageMax !== undefined) {
      parsedData.ageMax = Math.round(Number(parsedData.ageMax));
    }
    if (parsedData.ageMinMm !== undefined) {
      parsedData.ageMinMm = Math.round(Number(parsedData.ageMinMm));
    }
    if (parsedData.ageMaxMm !== undefined) {
      parsedData.ageMaxMm = Math.round(Number(parsedData.ageMaxMm));
    }

    if (!parsedData.organizationId || parsedData.organizationId === "") {
      parsedData.organizationId = null;
    }

    const validationResult = courseSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

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
      // Create the course with the new field structure
      const newCourse = await tx.course.create({
        data: {
          title: validatedData.title,
          titleMm: validatedData.titleMm || null,
          subtitle: validatedData.subtitle,
          subtitleMm: validatedData.subtitleMm || null,
          startDate: validatedData.startDate,
          startDateMm: validatedData.startDateMm || null,
          endDate: validatedData.endDate,
          endDateMm: validatedData.endDateMm || null,
          duration: validatedData.duration,
          durationMm: validatedData.durationMm || null,
          schedule: validatedData.schedule,
          scheduleMm: validatedData.scheduleMm || null,
          feeAmount: validatedData.feeAmount,
          feeAmountMm: validatedData.feeAmountMm || null,
          ageMin: validatedData.ageMin,
          ageMinMm: validatedData.ageMinMm || null,
          ageMax: validatedData.ageMax,
          ageMaxMm: validatedData.ageMaxMm || null,
          document: validatedData.document,
          documentMm: validatedData.documentMm || null,
          availableDays: validatedData.availableDays,
          description: validatedData.description || null,
          descriptionMm: validatedData.descriptionMm || null,
          outcomes: validatedData.outcomes,
          outcomesMm: validatedData.outcomesMm || [],
          scheduleDetails: validatedData.scheduleDetails || null,
          scheduleDetailsMm: validatedData.scheduleDetailsMm || null,
          selectionCriteria: validatedData.selectionCriteria,
          selectionCriteriaMm: validatedData.selectionCriteriaMm || [],
          organizationId: validatedData.organizationId || null,
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
      for (const badge of validatedData.badges) {
        await tx.badge.create({
          data: {
            text: badge.text,
            color: badge.color,
            backgroundColor: badge.backgroundColor,
            courseId: newCourse.id,
          },
        });
      }

      // Create FAQs
      for (const faq of validatedData.faq) {
        if (faq.question && faq.answer) {
          await tx.fAQ.create({
            data: {
              question: faq.question,
              questionMm: faq.questionMm || null,
              answer: faq.answer,
              answerMm: faq.answerMm || null,
              courseId: newCourse.id,
            },
          });
        }
      }

      return newCourse;
    });

    // Format the response to ensure compatibility with the frontend
    const formattedCourse = {
      ...course,
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
      endDate: course.endDate.toISOString(),
      endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
    };

    return NextResponse.json(formattedCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
