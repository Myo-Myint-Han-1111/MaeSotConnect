// app/api/org-admin/courses/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, DraftStatus, DraftType, CourseStatus } from "@/lib/auth/roles";
import { z } from "zod";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

// Course validation schema
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleMm: z.string().optional(),
  subtitle: z.string().min(1, "Subtitle is required"),
  subtitleMm: z.string().optional(),
  description: z.string().optional(),
  descriptionMm: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  startDateMm: z
    .string()
    .transform((str) => str ? new Date(str) : undefined)
    .optional(),
  endDate: z.string().transform((str) => new Date(str)),
  endDateMm: z
    .string()
    .transform((str) => str ? new Date(str) : undefined)
    .optional(),
  duration: z.number().positive(),
  durationMm: z.number().positive().optional(),
  schedule: z.string().min(1, "Schedule is required"),
  scheduleMm: z.string().optional(),
  feeAmount: z.number().min(0),
  feeAmountMm: z.number().min(0).optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  applyByDate: z
    .string()
    .transform((str) => str ? new Date(str) : undefined)
    .optional(),
  applyByDateMm: z
    .string()
    .transform((str) => str ? new Date(str) : undefined)
    .optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  ageMinMm: z.number().optional(),
  ageMaxMm: z.number().optional(),
  outcomes: z.array(z.string()).default([]),
  outcomesMm: z.array(z.string()).default([]),
  selectionCriteria: z.array(z.string()).default([]),
  selectionCriteriaMm: z.array(z.string()).default([]),
  howToApply: z.array(z.string()).default([]),
  howToApplyMm: z.array(z.string()).default([]),
  applyButtonText: z.string().optional(),
  applyButtonTextMm: z.string().optional(),
  applyLink: z.string().optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        questionMm: z.string().optional(),
        answer: z.string(),
        answerMm: z.string().optional(),
      })
    )
    .default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    let body;
    const contentType = request.headers.get("content-type");
    
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const dataString = formData.get("data") as string;
      if (!dataString) {
        return NextResponse.json({ error: "No data provided in form" }, { status: 400 });
      }
      
      try {
        const parsedData = JSON.parse(dataString);
        body = parsedData.content || parsedData;
      } catch (parseError) {
        console.error("Failed to parse JSON from FormData:", parseError);
        return NextResponse.json({ error: "Invalid JSON in form data" }, { status: 400 });
      }
    } else {
      body = await request.json();
    }
    
    const validatedData = courseSchema.parse(body);

    // Create a content draft for platform admin review
    const courseContent = {
      ...validatedData,
      organizationId: user.organizationId,
      createdBy: user.id,
      status: CourseStatus.DRAFT,
      // Convert dates back to ISO strings for JSON storage
      startDate: validatedData.startDate.toISOString(),
      endDate: validatedData.endDate.toISOString(),
      startDateMm: validatedData.startDateMm?.toISOString() || undefined,
      endDateMm: validatedData.endDateMm?.toISOString() || undefined,
      applyByDate: validatedData.applyByDate?.toISOString() || undefined,
      applyByDateMm: validatedData.applyByDateMm?.toISOString() || undefined,
    };

    const draft = await prisma.contentDraft.create({
      data: {
        title: validatedData.title,
        type: DraftType.COURSE,
        content: courseContent,
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

    return NextResponse.json(
      {
        message: "Course submitted for review successfully",
        draft,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course draft:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
