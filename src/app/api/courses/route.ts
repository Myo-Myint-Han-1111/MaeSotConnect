// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { generateCourseSlug, ensureUniqueSlug } from "@/lib/slugs";

// Update the Zod schema:
const courseSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    titleMm: z.string().optional(),
    subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
    subtitleMm: z.string().optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .pipe(z.coerce.date()),
    startDateMm: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    endDate: z.string().min(1, "End date is required").pipe(z.coerce.date()),
    endDateMm: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    duration: z.number().int().positive(),
    durationMm: z.number().int().positive().optional().nullable(),
    schedule: z.string().min(2, "Schedule must be at least 2 characters"),
    scheduleMm: z.string().optional(),
    feeAmount: z.number().nonnegative(),
    feeAmountMm: z.number().nonnegative().optional().nullable(),
    ageMin: z.number().int().nonnegative().optional().nullable(),
    ageMinMm: z.number().int().nonnegative().optional().nullable(),
    ageMax: z.number().int().nonnegative().optional().nullable(),
    ageMaxMm: z.number().int().nonnegative().optional().nullable(),
    document: z.string().optional().nullable(),
    documentMm: z.string().optional().nullable(),
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
    availableDays: z.array(z.boolean()).length(7, "Must provide 7 days"),
    description: z.string().optional(),
    descriptionMm: z.string().optional(),
    outcomes: z.array(z.string()),
    outcomesMm: z.array(z.string()).optional(),
    scheduleDetails: z.string().optional(),
    scheduleDetailsMm: z.string().optional(),
    selectionCriteria: z.array(z.string()),
    selectionCriteriaMm: z.array(z.string()).optional(),
    howToApply: z.array(z.string()).optional(),
    howToApplyMm: z.array(z.string()).optional(),
    applyButtonText: z.string().optional(),
    applyButtonTextMm: z.string().optional(),
    applyLink: z.string().url().optional().or(z.literal("")),
    estimatedDate: z.string().optional().nullable(),
    estimatedDateMm: z.string().optional().nullable(),
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
  })
  .refine(
    (data) => {
      // If either applyButtonText or applyButtonTextMm is provided, applyLink must be provided
      const hasButtonText = data.applyButtonText || data.applyButtonTextMm;
      return !hasButtonText || (hasButtonText && data.applyLink);
    },
    {
      message: "Apply link is required when apply button text is provided",
      path: ["applyLink"],
    }
  );

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can access courses
    if (session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
      address: course.address,
      applyByDate: course.applyByDate ? course.applyByDate.toISOString() : null,
      applyByDateMm: course.applyByDateMm
        ? course.applyByDateMm.toISOString()
        : null,
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
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

    // Must be platform admin
    if (session.user.role !== "PLATFORM_ADMIN") {
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

    console.log("Received data:", parsedData);

    // Make sure arrays are properly formatted
    if (!Array.isArray(parsedData.howToApply)) {
      parsedData.howToApply = [];
    }
    if (!Array.isArray(parsedData.howToApplyMm)) {
      parsedData.howToApplyMm = [];
    }

    // Convert fee amounts to proper numbers
    if (parsedData.feeAmount !== undefined) {
      parsedData.feeAmount = Math.round(Number(parsedData.feeAmount));
    }
    if (parsedData.feeAmountMm !== undefined) {
      parsedData.feeAmountMm = Math.round(Number(parsedData.feeAmountMm));
    }

    // Validate required dates
    if (!parsedData.startDate || parsedData.startDate === "") {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    if (!parsedData.endDate || parsedData.endDate === "") {
      return NextResponse.json(
        { error: "End date is required" },
        { status: 400 }
      );
    }

    // Ensure numeric fields are proper integers
    if (parsedData.duration !== undefined) {
      parsedData.duration = Math.round(Number(parsedData.duration));
    }
    if (parsedData.durationMm !== undefined) {
      parsedData.durationMm = Math.round(Number(parsedData.durationMm));
    }

    // Handle age fields properly - convert to null if empty/invalid
    if (parsedData.ageMin !== undefined) {
      const ageMinValue = Number(parsedData.ageMin);
      parsedData.ageMin =
        isNaN(ageMinValue) || ageMinValue <= 0 ? null : Math.round(ageMinValue);
    }
    if (parsedData.ageMax !== undefined) {
      const ageMaxValue = Number(parsedData.ageMax);
      parsedData.ageMax =
        isNaN(ageMaxValue) || ageMaxValue <= 0 ? null : Math.round(ageMaxValue);
    }
    if (parsedData.ageMinMm !== undefined) {
      const ageMinMmValue = Number(parsedData.ageMinMm);
      parsedData.ageMinMm =
        isNaN(ageMinMmValue) || ageMinMmValue <= 0
          ? null
          : Math.round(ageMinMmValue);
    }
    if (parsedData.ageMaxMm !== undefined) {
      const ageMaxMmValue = Number(parsedData.ageMaxMm);
      parsedData.ageMaxMm =
        isNaN(ageMaxMmValue) || ageMaxMmValue <= 0
          ? null
          : Math.round(ageMaxMmValue);
    }

    // Also handle document fields as optional
    if (!parsedData.document || parsedData.document.trim() === "") {
      parsedData.document = null;
    }
    if (!parsedData.documentMm || parsedData.documentMm.trim() === "") {
      parsedData.documentMm = null;
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

    // Process and save image files
    const imageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (
        key.startsWith("image_") &&
        key !== "logoImage" &&
        value instanceof File
      ) {
        const imageUrl = await saveFile(value, undefined, "course");
        imageUrls.push(imageUrl);
      }
    }

    // Get organization name for slug generation
    let orgName: string | undefined;
    if (validatedData.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: validatedData.organizationId },
        select: { name: true },
      });
      orgName = org?.name;
    }

    // Generate initial base slug (without course ID)
    const initialBaseSlug = generateCourseSlug(
      validatedData.title,
      orgName,
      undefined
    );

    // Create the course with all related entities in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // Create the course with temporary slug
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
          ageMin: validatedData.ageMin || null,
          ageMinMm: validatedData.ageMinMm || null,
          ageMax: validatedData.ageMax || null,
          ageMaxMm: validatedData.ageMaxMm || null,
          document: validatedData.document,
          documentMm: validatedData.documentMm || null,
          province: validatedData.province || null,
          district: validatedData.district || null,
          address: validatedData.address || null,
          applyByDate: validatedData.applyByDate || null,
          applyByDateMm: validatedData.applyByDateMm || null,
          availableDays: validatedData.availableDays,
          description: validatedData.description || null,
          descriptionMm: validatedData.descriptionMm || null,
          outcomes: validatedData.outcomes,
          outcomesMm: validatedData.outcomesMm || [],
          scheduleDetails: validatedData.scheduleDetails || null,
          scheduleDetailsMm: validatedData.scheduleDetailsMm || null,
          selectionCriteria: validatedData.selectionCriteria,
          selectionCriteriaMm: validatedData.selectionCriteriaMm || [],
          howToApply: validatedData.howToApply || [],
          howToApplyMm: validatedData.howToApplyMm || [],
          applyButtonText: validatedData.applyButtonText || null,
          applyButtonTextMm: validatedData.applyButtonTextMm || null,
          applyLink: validatedData.applyLink || null,
          estimatedDate: validatedData.estimatedDate || null,
          estimatedDateMm: validatedData.estimatedDateMm || null,
          organizationId: validatedData.organizationId || null,
          slug: `${initialBaseSlug}-temp-${Date.now()}`,
        },
      });

      // Generate final slug with course ID
      const finalBaseSlug = generateCourseSlug(
        validatedData.title,
        orgName,
        newCourse.id
      );

      // Ensure slug uniqueness
      const finalSlug = await ensureUniqueSlug(finalBaseSlug, async (slug) => {
        const existing = await tx.course.findUnique({ where: { slug } });
        return !!existing;
      });

      // Update course with final slug
      const updatedCourse = await tx.course.update({
        where: { id: newCourse.id },
        data: { slug: finalSlug },
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

      return updatedCourse;
    });

    // Format the response
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
