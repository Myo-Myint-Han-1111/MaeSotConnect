// src/app/api/courses/[id]/route.ts - Fixed version with your existing code

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";

// Input validation schema updated to match the new Prisma schema
const courseSchema = z.object({
  title: z.string().min(2),
  titleMm: z.string().optional(),
  subtitle: z.string().min(2),
  subtitleMm: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  applyByDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  applyByDateMm: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  logoImage: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  startDateMm: z.coerce.date().optional(),
  endDate: z.coerce.date(),
  endDateMm: z.coerce.date().optional(),
  duration: z.number().int().positive(),
  durationMm: z.number().int().positive().optional(),
  schedule: z.string().min(2),
  scheduleMm: z.string().optional(),
  feeAmount: z.number().nonnegative(),
  feeAmountMm: z.number().int().nonnegative().optional(),
  ageMin: z.number().int().nonnegative(),
  ageMinMm: z.number().int().nonnegative().optional(),
  ageMax: z.number().int().positive(),
  ageMaxMm: z.number().int().positive().optional(),
  document: z.string(),
  documentMm: z.string().optional(),
  availableDays: z.array(z.boolean()).length(7),
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

// Helper function to safely filter string arrays
const filterStringArray = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (item: unknown): item is string =>
      typeof item === "string" && item.trim().length > 0
  );
};

// Helper function to safely convert to integer
const safeInteger = (value: unknown, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === "")
    return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : Math.round(num);
};

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

      // ADD new fields
      province: course.province,
      district: course.district,
      address: course.address,
      applyByDate: course.applyByDate ? course.applyByDate.toISOString() : null,
      applyByDateMm: course.applyByDateMm
        ? course.applyByDateMm.toISOString()
        : null,
      logoImage: course.logoImage,
      // Convert DateTime objects to ISO strings
      startDate: course.startDate.toISOString(),
      startDateMm: null, // No longer exists
      endDate: course.endDate.toISOString(),
      endDateMm: null, // No longer exists
      duration: course.duration,
      durationMm: null, // No longer exists
      schedule: course.schedule,
      scheduleMm: course.scheduleMm,
      // Include both new fee fields and backward compatible fields
      feeAmount: course.feeAmount,
      feeAmountMm: null, // No longer exists
      fee: course.feeAmount.toString(),
      feeMm: null, // No longer exists
      // Include age fields
      ageMin: course.ageMin,
      ageMinMm: null, // No longer exists
      ageMax: course.ageMax,
      ageMaxMm: null, // No longer exists
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
    // Process logo image separately
    let logoImageUrl: string | null = null;
    const logoImageFile = formData.get("logoImage");
    if (logoImageFile && logoImageFile instanceof File) {
      logoImageUrl = await saveFile(
        logoImageFile,
        session.user.organizationId ?? undefined,
        "logo"
      );
    }
    // Parse the JSON data
    const parsedData = JSON.parse(jsonData);

    // Clean and convert all data types properly with type safety
    const cleanedData = {
      ...parsedData,
      // Convert numbers properly with safe integer conversion
      feeAmount: safeInteger(parsedData.feeAmount, 0),
      feeAmountMm:
        parsedData.feeAmountMm !== undefined && parsedData.feeAmountMm !== null
          ? safeInteger(parsedData.feeAmountMm, 0)
          : undefined,
      duration: safeInteger(parsedData.duration, 1),
      durationMm:
        parsedData.durationMm !== undefined && parsedData.durationMm !== null
          ? safeInteger(parsedData.durationMm, 1)
          : undefined,
      ageMin: safeInteger(parsedData.ageMin, 0),
      ageMax: safeInteger(parsedData.ageMax, 100),
      ageMinMm:
        parsedData.ageMinMm !== undefined && parsedData.ageMinMm !== null
          ? safeInteger(parsedData.ageMinMm, 0)
          : undefined,
      ageMaxMm:
        parsedData.ageMaxMm !== undefined && parsedData.ageMaxMm !== null
          ? safeInteger(parsedData.ageMaxMm, 100)
          : undefined,

      // Clean arrays with type safety
      availableDays: Array.isArray(parsedData.availableDays)
        ? parsedData.availableDays.map(Boolean) // Ensure all values are proper booleans
        : [false, false, false, false, false, false, false],
      outcomes: filterStringArray(parsedData.outcomes),
      outcomesMm: filterStringArray(parsedData.outcomesMm),
      selectionCriteria: filterStringArray(parsedData.selectionCriteria),
      selectionCriteriaMm: filterStringArray(parsedData.selectionCriteriaMm),

      // Clean string fields
      titleMm: parsedData.titleMm || undefined,
      subtitleMm: parsedData.subtitleMm || undefined,
      scheduleMm: parsedData.scheduleMm || undefined,
      description: parsedData.description || undefined,
      descriptionMm: parsedData.descriptionMm || undefined,
      scheduleDetails: parsedData.scheduleDetails || undefined,
      scheduleDetailsMm: parsedData.scheduleDetailsMm || undefined,
      documentMm: parsedData.documentMm || undefined,
    };

    const validationResult = courseSchema.safeParse(cleanedData);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

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

    // Process and save new image files (regular course images) - EXCLUDE logo
    const newImageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (
        key.startsWith("image_") &&
        key !== "logoImage" &&
        value instanceof File
      ) {
        const imageUrl = await saveFile(
          value,
          session.user.organizationId ?? undefined,
          "course"
        );
        newImageUrls.push(imageUrl);
      }
    }
    // Combine existing and new image URLs
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    // Update the course with the new fields
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title: validatedData.title,
        titleMm: validatedData.titleMm || null,
        subtitle: validatedData.subtitle,
        subtitleMm: validatedData.subtitleMm || null,
        address: validatedData.address || null,
        applyByDate: validatedData.applyByDate || null,
        applyByDateMm: validatedData.applyByDateMm || null,
        logoImage: logoImageUrl || validatedData.logoImage || null,
        // REMOVE location fields, ADD new ones
        province: validatedData.province,
        district: validatedData.district,
        startDate: validatedData.startDate,
        // REMOVE startDateMm: validatedData.startDateMm || null,
        endDate: validatedData.endDate,
        // REMOVE endDateMm: validatedData.endDateMm || null,
        duration: validatedData.duration,
        // REMOVE durationMm: validatedData.durationMm || null,
        schedule: validatedData.schedule,
        scheduleMm: validatedData.scheduleMm || null,
        feeAmount: validatedData.feeAmount,
        // REMOVE feeAmountMm: validatedData.feeAmountMm || null,
        ageMin: validatedData.ageMin,
        // REMOVE ageMinMm: validatedData.ageMinMm || null,
        ageMax: validatedData.ageMax,
        // REMOVE ageMaxMm: validatedData.ageMaxMm || null,
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
        organizationId: validatedData.organizationId,
      },
    });

    // Now update related entities in a separate transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing images and then create new entries for all images
      await tx.image.deleteMany({
        where: { courseId: id },
      });

      // Create entries for all combined images (both kept existing and new)
      for (const imageUrl of allImageUrls) {
        await tx.image.create({
          data: {
            url: imageUrl,
            courseId: id,
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
            courseId: id,
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
              questionMm: faq.questionMm || null,
              answer: faq.answer,
              answerMm: faq.answerMm || null,
              courseId: id,
            },
          });
        }
      }
    });

    // Format the response to ensure dates and other fields are properly formatted
    const formattedCourse = {
      ...updatedCourse,
      startDate: updatedCourse.startDate.toISOString(),
      startDateMm: updatedCourse.startDateMm
        ? updatedCourse.startDateMm.toISOString()
        : null,
      endDate: updatedCourse.endDate.toISOString(),
      endDateMm: updatedCourse.endDateMm
        ? updatedCourse.endDateMm.toISOString()
        : null,
      // Add empty location fields for backward compatibility
      location: "",
      locationMm: null,
      // Include both new fee fields and backward compatible fields
      fee: updatedCourse.feeAmount.toString(),
      feeMm: updatedCourse.feeAmountMm
        ? updatedCourse.feeAmountMm.toString()
        : null,
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
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
