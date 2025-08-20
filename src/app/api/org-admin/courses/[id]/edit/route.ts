// app/api/org-admin/courses/[id]/edit/route.ts
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

    // Get the existing course
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

    const body = await request.json();

    // Create the updated course content
    const updatedCourseContent = {
      ...body,
      id: existingCourse.id,
      organizationId: user.organizationId,
      lastModifiedBy: user.id,
      originalCourseId: existingCourse.id, // Reference to the original course
    };

    // Create a content draft for the course update
    const draft = await prisma.contentDraft.create({
      data: {
        title: `Updated: ${body.title || existingCourse.title}`,
        type: DraftType.COURSE,
        content: updatedCourseContent,
        status: DraftStatus.PENDING,
        createdBy: user.id,
        organizationId: user.organizationId,
        submittedAt: new Date(),
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    // Try to update the course status - if fields don't exist yet, skip this
    try {
      await prisma.course.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          // Only include these fields if they exist in your schema
          ...(existingCourse.hasOwnProperty("lastModifiedBy") && {
            lastModifiedBy: user.id,
          }),
          ...(existingCourse.hasOwnProperty("status") && {
            status: "UNDER_REVIEW",
          }),
        },
      });
    } catch (updateError) {
      // If update fails due to missing fields, that's okay - the draft is still created
      console.log(
        "Could not update course status (fields may not exist yet):",
        updateError
      );
    }

    return NextResponse.json(
      {
        message: "Course changes submitted for review successfully",
        draft,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating course edit draft:", error);
    return NextResponse.json(
      { error: "Failed to submit course changes" },
      { status: 500 }
    );
  }
}
