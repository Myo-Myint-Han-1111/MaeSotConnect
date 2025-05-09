// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth";
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

    // Format data to match the expected structure - NOW WITH MYANMAR FIELDS
    const formattedCourse = {
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

// This focuses on the PUT handler in your api/courses/[id]/route.ts file
// to fix image handling during course updates

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await getServerSession(authOptions);

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
    const validationResult = courseSchema.safeParse(parsedData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Organization admins can only update courses for their own organization
    if (
      session.user.role === "ORGANIZATION_ADMIN" &&
      (session.user.organizationId !== parsedData.organizationId ||
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
        const imageUrl = await saveFile(value);
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
      // Update the course - NOW WITH MYANMAR FIELDS
      const updatedCourse = await tx.course.update({
        where: { id },
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
          organizationId: parsedData.organizationId,
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

      for (const badge of parsedData.badges) {
        await tx.badge.create({
          data: {
            text: badge.text,
            color: badge.color,
            backgroundColor: badge.backgroundColor,
            courseId: updatedCourse.id,
          },
        });
      }

      // Update FAQs - delete old ones and add new ones - NOW WITH MYANMAR FIELDS
      await tx.fAQ.deleteMany({
        where: { courseId: id },
      });

      for (const faq of parsedData.faq) {
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

    return NextResponse.json(course);
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
    const session = await getServerSession(authOptions);

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
