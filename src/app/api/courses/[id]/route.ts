// src/app/api/courses/[id]/route.ts - Fixed version with your existing code

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { generateCourseSlug, ensureUniqueSlug } from "@/lib/slugs";

// Add this courseSchema after the imports
const courseSchema = z.object({
  title: z.string().min(2),
  titleMm: z.string().optional().nullable(),
  subtitle: z.string().min(2),
  subtitleMm: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  applyByDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? new Date(val) : null)),
  applyByDateMm: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? new Date(val) : null)),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  duration: z.number().int().positive(),
  schedule: z.string().min(2),
  scheduleMm: z.string().optional().nullable(),
  feeAmount: z.number().nonnegative(),
  ageMin: z.number().int().nonnegative(),
  ageMax: z.number().int().positive(),
  document: z.string(),
  documentMm: z.string().optional().nullable(),
  availableDays: z.array(z.boolean()).length(7),
  description: z.string().optional().nullable(),
  descriptionMm: z.string().optional().nullable(),
  outcomes: z.array(z.string()),
  outcomesMm: z.array(z.string()).optional(),
  scheduleDetails: z.string().optional().nullable(),
  scheduleDetailsMm: z.string().optional().nullable(),
  selectionCriteria: z.array(z.string()),
  selectionCriteriaMm: z.array(z.string()).optional(),
  howToApply: z.array(z.string()).optional().default([]),
  howToApplyMm: z.array(z.string()).optional().default([]),
  applyButtonText: z.string().optional().nullable(),
  applyButtonTextMm: z.string().optional().nullable(),
  applyLink: z.string().optional().nullable(),
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
      questionMm: z.string().optional().nullable(),
      answer: z.string(),
      answerMm: z.string().optional().nullable(),
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
  const idOrSlug = resolvedParams.id;

  try {
    // Try to find course by slug first, then by ID
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
      },
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
      howToApply: course.howToApply,
      howToApplyMm: course.howToApplyMm,
      applyButtonText: course.applyButtonText,
      applyButtonTextMm: course.applyButtonTextMm,
      applyLink: course.applyLink,
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

    // Parse the JSON data
    const parsedData = JSON.parse(jsonData);

    // Clean and convert all data types properly with type safety
    const cleanedData = {
      ...parsedData,
      // Convert numbers properly with safe integer conversion
      feeAmount: safeInteger(parsedData.feeAmount, 0),
      duration: safeInteger(parsedData.duration, 1),
      ageMin: safeInteger(parsedData.ageMin, 0),
      ageMax: safeInteger(parsedData.ageMax, 100),

      // Clean arrays with type safety
      availableDays: Array.isArray(parsedData.availableDays)
        ? parsedData.availableDays.map(Boolean)
        : [false, false, false, false, false, false, false],
      outcomes: filterStringArray(parsedData.outcomes),
      outcomesMm: filterStringArray(parsedData.outcomesMm),
      selectionCriteria: filterStringArray(parsedData.selectionCriteria),
      selectionCriteriaMm: filterStringArray(parsedData.selectionCriteriaMm),

      // Clean string fields - convert null/undefined to null for optional fields
      titleMm: parsedData.titleMm || null,
      subtitleMm: parsedData.subtitleMm || null,
      scheduleMm: parsedData.scheduleMm || null,
      description: parsedData.description || null,
      descriptionMm: parsedData.descriptionMm || null,
      scheduleDetails: parsedData.scheduleDetails || null,
      scheduleDetailsMm: parsedData.scheduleDetailsMm || null,
      documentMm: parsedData.documentMm || null,
      province: parsedData.province || null,
      district: parsedData.district || null,
      address: parsedData.address || null,

      // Handle date fields properly
      applyByDate:
        parsedData.applyByDate && parsedData.applyByDate.trim() !== ""
          ? parsedData.applyByDate
          : null,
      applyByDateMm:
        parsedData.applyByDateMm && parsedData.applyByDateMm.trim() !== ""
          ? parsedData.applyByDateMm
          : null,
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

    // Process and save new image files
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

    // Get organization name for slug generation
    let orgName: string | undefined;
    if (validatedData.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: validatedData.organizationId },
        select: { name: true },
      });
      orgName = org?.name;
    }

    // Generate new slug with course ID
    const newBaseSlug = generateCourseSlug(validatedData.title, orgName, id);

    // Ensure slug uniqueness (exclude current course from check)
    const newSlug = await ensureUniqueSlug(newBaseSlug, async (slug) => {
      const existing = await prisma.course.findFirst({
        where: {
          slug,
          id: { not: id }, // Exclude current course
        },
      });
      return !!existing;
    });

    // Update course and related entities in a SINGLE transaction with increased timeout
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Update the main course record with new slug
        const updatedCourse = await tx.course.update({
          where: { id },
          data: {
            title: validatedData.title,
            titleMm: validatedData.titleMm,
            subtitle: validatedData.subtitle,
            subtitleMm: validatedData.subtitleMm,
            address: validatedData.address,
            applyByDate: validatedData.applyByDate,
            applyByDateMm: validatedData.applyByDateMm,
            province: validatedData.province,
            district: validatedData.district,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            duration: validatedData.duration,
            schedule: validatedData.schedule,
            scheduleMm: validatedData.scheduleMm,
            feeAmount: validatedData.feeAmount,
            ageMin: validatedData.ageMin,
            ageMax: validatedData.ageMax,
            document: validatedData.document,
            documentMm: validatedData.documentMm,
            availableDays: validatedData.availableDays,
            description: validatedData.description,
            descriptionMm: validatedData.descriptionMm,
            outcomes: validatedData.outcomes,
            outcomesMm: validatedData.outcomesMm,
            scheduleDetails: validatedData.scheduleDetails,
            scheduleDetailsMm: validatedData.scheduleDetailsMm,
            selectionCriteria: validatedData.selectionCriteria,
            selectionCriteriaMm: validatedData.selectionCriteriaMm,
            howToApply: validatedData.howToApply,
            howToApplyMm: validatedData.howToApplyMm,
            applyButtonText: validatedData.applyButtonText,
            applyButtonTextMm: validatedData.applyButtonTextMm,
            applyLink: validatedData.applyLink,
            organizationId: validatedData.organizationId,

            slug: newSlug, // Update slug
          },
        });

        // 2. Handle images
        await tx.image.deleteMany({ where: { courseId: id } });

        if (allImageUrls.length > 0) {
          await tx.image.createMany({
            data: allImageUrls.map((url) => ({
              url,
              courseId: id,
            })),
          });
        }

        // 3. Handle badges
        await tx.badge.deleteMany({ where: { courseId: id } });

        if (validatedData.badges.length > 0) {
          await tx.badge.createMany({
            data: validatedData.badges.map((badge) => ({
              text: badge.text,
              color: badge.color,
              backgroundColor: badge.backgroundColor,
              courseId: id,
            })),
          });
        }

        // 4. Handle FAQs
        await tx.fAQ.deleteMany({ where: { courseId: id } });

        const validFaqs = validatedData.faq.filter(
          (faq) => faq.question && faq.answer
        );
        if (validFaqs.length > 0) {
          await tx.fAQ.createMany({
            data: validFaqs.map((faq) => ({
              question: faq.question,
              questionMm: faq.questionMm || null,
              answer: faq.answer,
              answerMm: faq.answerMm || null,
              courseId: id,
            })),
          });
        }

        return updatedCourse;
      },
      {
        timeout: 15000, // Increase timeout to 15 seconds
      }
    );

    // Format the response to ensure dates are properly formatted
    const formattedCourse = {
      ...result,
      startDate: result.startDate.toISOString(),
      endDate: result.endDate.toISOString(),
      applyByDate: result.applyByDate ? result.applyByDate.toISOString() : null,
      applyByDateMm: result.applyByDateMm
        ? result.applyByDateMm.toISOString()
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
