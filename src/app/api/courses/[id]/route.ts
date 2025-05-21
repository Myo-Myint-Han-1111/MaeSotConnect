// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";

// Input validation schema updated to match the new Prisma schema
const courseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  titleMm: z.string().optional(),
  subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
  subtitleMm: z.string().optional(),
  location: z.string().optional(), // Keep for backward compatibility
  locationMm: z.string().optional(), // Keep for backward compatibility
  // Explicitly transform date strings to Date objects
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
  fee: z.string().optional(), // Keep for backward compatibility
  feeMm: z.string().optional(), // Keep for backward compatibility
  feeAmount: z.number().nonnegative(), // New field
  feeAmountMm: z.number().nonnegative().optional(), // New field
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Wait for params to be fully resolved
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        images: true,
        badges: true,
        faq: true,
        organizationInfo: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Format data to match the expected structure with new fields
    const formattedCourse = {
      id: course.id,
      title: course.title,
      titleMm: course.titleMm,
      subtitle: course.subtitle,
      subtitleMm: course.subtitleMm,
      // Add empty location fields for backward compatibility
      location: "",
      locationMm: null,
      // Convert DateTime objects to ISO strings
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
      endDate: course.endDate.toISOString(),
      endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
      duration: course.duration,
      durationMm: course.durationMm,
      schedule: course.schedule,
      scheduleMm: course.scheduleMm,
      // Include both new fee fields and backward compatible fields
      feeAmount: course.feeAmount,
      feeAmountMm: course.feeAmountMm,
      fee: course.feeAmount.toString(),
      feeMm: course.feeAmountMm ? course.feeAmountMm.toString() : null,
      // Include new age fields
      ageMin: course.ageMin,
      ageMinMm: course.ageMinMm,
      ageMax: course.ageMax,
      ageMaxMm: course.ageMaxMm,
      // Include document fields
      document: course.document,
      documentMm: course.documentMm,
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
      faq: course.faq.map((item) => ({
        id: item.id,
        question: item.question,
        questionMm: item.questionMm,
        answer: item.answer,
        answerMm: item.answerMm,
        courseId: item.courseId,
      })),
      organizationInfo: course.organizationInfo
        ? {
            ...course.organizationInfo,
            mapLocation: {
              lat: course.organizationInfo.latitude,
              lng: course.organizationInfo.longitude,
            },
          }
        : undefined,
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check permissions
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        session.user.organizationId !== existingCourse.organizationId)
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
    console.log("Received update data:", parsedData); // Debug log

    // Validate with Zod and transform the data
    const validationResult = courseSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors); // Debug log
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Get the validated and transformed data
    const validatedData = validationResult.data;
    console.log("Validated update data:", validatedData); // Debug log

    // Organization admins can only update courses for their own organization
    if (
      session.user.role === "ORGANIZATION_ADMIN" &&
      (session.user.organizationId !== validatedData.organizationId ||
        session.user.organizationId !== existingCourse.organizationId)
    ) {
      return NextResponse.json(
        { error: "You can only update courses for your own organization" },
        { status: 403 }
      );
    }

    // Process existing images from the form
    const existingImagesJSON = formData.get("existingImages");
    let existingImageUrls: string[] = [];

    if (existingImagesJSON && typeof existingImagesJSON === "string") {
      try {
        existingImageUrls = JSON.parse(existingImagesJSON);
      } catch (error) {
        console.error("Error parsing existingImages:", error);
      }
    }

    // Process and save new image files
    const newImageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        const imageUrl = await saveFile(
          value,
          session.user.organizationId ?? undefined
        );
        newImageUrls.push(imageUrl);
      }
    }

    // Combine existing and new image URLs
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    console.log("Existing images:", existingImageUrls);
    console.log("New images:", newImageUrls);
    console.log("All images:", allImageUrls);

    // Update the course with all related entities in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // Update the course with the new fields
      const updatedCourse = await tx.course.update({
        where: { id },
        data: {
          title: validatedData.title,
          titleMm: validatedData.titleMm,
          subtitle: validatedData.subtitle,
          subtitleMm: validatedData.subtitleMm,
          startDate: validatedData.startDate,
          startDateMm: validatedData.startDateMm,
          endDate: validatedData.endDate,
          endDateMm: validatedData.endDateMm,
          duration: validatedData.duration,
          durationMm: validatedData.durationMm,
          schedule: validatedData.schedule,
          scheduleMm: validatedData.scheduleMm,
          feeAmount: validatedData.feeAmount,
          feeAmountMm: validatedData.feeAmountMm,
          ageMin: validatedData.ageMin,
          ageMinMm: validatedData.ageMinMm,
          ageMax: validatedData.ageMax,
          ageMaxMm: validatedData.ageMaxMm,
          document: validatedData.document,
          documentMm: validatedData.documentMm,
          availableDays: validatedData.availableDays,
          description: validatedData.description,
          descriptionMm: validatedData.descriptionMm,
          outcomes: validatedData.outcomes,
          outcomesMm: validatedData.outcomesMm || [],
          scheduleDetails: validatedData.scheduleDetails,
          scheduleDetailsMm: validatedData.scheduleDetailsMm,
          selectionCriteria: validatedData.selectionCriteria,
          selectionCriteriaMm: validatedData.selectionCriteriaMm || [],
          organizationId: validatedData.organizationId,
        },
      });

      // Delete all existing images and then create new entries for all images
      await tx.image.deleteMany({
        where: { courseId: id },
      });

      // Create entries for all combined images (both kept existing and new)
      for (const imageUrl of allImageUrls) {
        await tx.image.create({
          data: {
            url: imageUrl,
            courseId: updatedCourse.id,
          },
        });
      }

      // Update badges - delete old ones and add new ones
      await tx.badge.deleteMany({
        where: { courseId: id },
      });

      for (const badge of validatedData.badges) {
        await tx.badge.create({
          data: {
            text: badge.text,
            color: badge.color,
            backgroundColor: badge.backgroundColor,
            courseId: updatedCourse.id,
          },
        });
      }

      // Update FAQs - delete old ones and add new ones
      await tx.fAQ.deleteMany({
        where: { courseId: id },
      });

      for (const faq of validatedData.faq) {
        if (faq.question && faq.answer) {
          await tx.fAQ.create({
            data: {
              question: faq.question,
              questionMm: faq.questionMm,
              answer: faq.answer,
              answerMm: faq.answerMm,
              courseId: updatedCourse.id,
            },
          });
        }
      }

      return updatedCourse;
    });

    // Format the response to ensure dates and other fields are properly formatted
    const formattedCourse = {
      ...course,
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
      endDate: course.endDate.toISOString(),
      endDateMm: course.endDateMm ? course.endDateMm.toISOString() : null,
      // Add empty location fields for backward compatibility
      location: "",
      locationMm: null,
      // Include both new fee fields and backward compatible fields
      fee: course.feeAmount.toString(),
      feeMm: course.feeAmountMm ? course.feeAmountMm.toString() : null,
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        error: "Failed to update course",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Get existing course to check permissions
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        images: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check permissions
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        session.user.organizationId !== existingCourse.organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the course and all related entities using cascading deletes
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
