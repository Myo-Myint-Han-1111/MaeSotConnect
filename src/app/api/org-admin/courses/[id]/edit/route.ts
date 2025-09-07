// src/app/api/org-admin/courses/[id]/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, DraftStatus, DraftType } from "@/lib/auth/roles";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Get the existing course with all related data
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        images: true,
        badges: true,
        faq: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if the course belongs to the user's organization
    if (existingCourse.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if course is already being edited (has an active draft)
    const existingDraft = await prisma.contentDraft.findFirst({
      where: {
        originalCourseId: id,
        status: {
          in: [DraftStatus.PENDING, DraftStatus.DRAFT],
        },
      },
    });

    if (existingDraft) {
      return NextResponse.json(
        {
          error:
            "Course is already being edited. Please complete the existing draft first.",
        },
        { status: 400 }
      );
    }

    // 🎯 HANDLE FORMDATA FROM THE FORM
    const formData = await request.formData();
    const jsonData = formData.get("data");

    if (!jsonData || typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const body = JSON.parse(jsonData);

    // 🎯 STEP 1: Create draft with ALL course data + edits
    // The form sends data in body.content structure
    const formContent = body.content || {};

    const completeContent = {
      // Original course data
      ...existingCourse,
      // User's edits override original data
      ...formContent,
      // Preserve important IDs
      id: existingCourse.id,
      organizationId: user.organizationId,
      lastModifiedBy: user.id,
      // Convert dates to ISO strings for JSON storage
      duration: formContent.duration || existingCourse.duration,
      durationUnit:
        formContent.durationUnit || existingCourse.durationUnit || "DAYS",
      durationUnitMm:
        formContent.durationUnitMm || existingCourse.durationUnitMm,
      startDate:
        formContent.startDate || existingCourse.startDate.toISOString(),
      endDate: formContent.endDate || existingCourse.endDate.toISOString(),
      applyByDate:
        formContent.applyByDate || existingCourse.applyByDate?.toISOString(),
      startByDate:
        formContent.startByDate || existingCourse.startByDate?.toISOString(),
      createdAt: existingCourse.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: existingCourse.publishedAt?.toISOString(),
      estimatedDate:
        formContent.estimatedDate || existingCourse.estimatedDate || null,
      estimatedDateMm:
        formContent.estimatedDateMm || existingCourse.estimatedDateMm || null,
      // Include related data
      images: existingCourse.images,
      badges: existingCourse.badges,
      faq: existingCourse.faq,
    };

    // 🎯 DEBUG: Log what we're about to create
    console.log("🔍 Creating draft for course:", existingCourse.id);
    console.log(
      "🔍 Draft title will be:",
      `Updated: ${body.title || existingCourse.title}`
    );
    await prisma.$transaction(async (tx) => {
      // 🎯 STEP 2: Create the draft with reference to original course
      const createdDraft = await tx.contentDraft.create({
        data: {
          title: `Updated: ${body.title || existingCourse.title}`,
          type: DraftType.COURSE,
          content: completeContent,
          status: DraftStatus.PENDING,
          createdBy: user.id,
          organizationId: user.organizationId,
          originalCourseId: existingCourse.id, // 🆕 CRITICAL: Link to original
          submittedAt: new Date(),
        },
      });

      console.log(
        "🔍 Created draft:",
        createdDraft.id,
        "for original course:",
        existingCourse.id
      );

      // 🎯 STEP 3: HIDE the original course (set to UNDER_REVIEW)
      try {
        const updatedCourse = await tx.course.update({
          where: { id: existingCourse.id },
          data: {
            status: "UNDER_REVIEW", // Hide from public but keep in database
            lastModifiedBy: user.id,
            updatedAt: new Date(),
          },
        });
        console.log(
          "🔍 Updated course status to UNDER_REVIEW:",
          updatedCourse.id
        );
      } catch (_statusError) {
        // If status field doesn't exist, just update metadata
        console.log("Status field not available, updating without status");
        await tx.course.update({
          where: { id: existingCourse.id },
          data: {
            lastModifiedBy: user.id,
            updatedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({
      message: "Course submitted for review successfully",
      originalCourseId: existingCourse.id,
    });
  } catch (error) {
    console.error("Error submitting course edit:", error);
    return NextResponse.json(
      { error: "Failed to submit course edit" },
      { status: 500 }
    );
  }
}

// Handle PATCH for draft updates (when editing existing drafts)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;
    const { id: draftId } = await params;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Find the existing draft
    const existingDraft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (existingDraft.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Update the draft content
    const updatedContent = {
      ...(existingDraft.content as Record<string, unknown>),
      ...body,
      lastModifiedBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        title: body.title || existingDraft.title,
        content: updatedContent,
        status: DraftStatus.PENDING, // Always pending when updated
        submittedAt: new Date(), // Update submission time
      },
    });

    return NextResponse.json({
      message: "Draft updated successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}
