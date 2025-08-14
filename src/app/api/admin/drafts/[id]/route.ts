// src/app/api/admin/drafts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { DraftStatus } from "@/lib/auth/roles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current session to check permissions
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can view draft details
    if (session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    
    const draft = await prisma.contentDraft.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current session to check permissions
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can review drafts
    if (session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    // Validate status
    if (!Object.values(DraftStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Require review notes for rejections
    if (status === DraftStatus.REJECTED && (!reviewNotes || !reviewNotes.trim())) {
      return NextResponse.json(
        { error: "Review notes are required for rejections" },
        { status: 400 }
      );
    }

    const { id } = await params;
    
    // Get the draft to check if it exists
    const existingDraft = await prisma.contentDraft.findUnique({
      where: { id },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // If approving, create the course
    if (status === DraftStatus.APPROVED) {
      // Start a transaction to both update draft and create course
      const result = await prisma.$transaction(async (tx) => {
        // Update the draft status
        const updatedDraft = await tx.contentDraft.update({
          where: { id },
          data: {
            status: DraftStatus.APPROVED,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
            reviewNotes: reviewNotes?.trim() || null,
          },
          include: {
            author: true,
            organization: true,
          },
        });

        // Create the course from the draft content
        const courseData = updatedDraft.content as Record<string, unknown>;
        
        // Generate course ID
        const courseId = crypto.randomUUID();

        // Generate a unique slug
        const baseSlug = (courseData.title as string || "course").toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure slug uniqueness
        while (await tx.course.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        const course = await tx.course.create({
          data: {
            id: courseId,
            title: (courseData.title as string) || "",
            titleMm: (courseData.titleMm as string) || "",
            subtitle: (courseData.subtitle as string) || "",
            subtitleMm: (courseData.subtitleMm as string) || "",
            description: (courseData.description as string) || "",
            descriptionMm: (courseData.descriptionMm as string) || "",
            province: (courseData.province as string) || "",
            district: (courseData.district as string) || "",
            address: (courseData.address as string) || "",
            applyByDate: courseData.applyByDate ? new Date(courseData.applyByDate as string) : null,
            applyByDateMm: courseData.applyByDateMm ? new Date(courseData.applyByDateMm as string) : null,
            startDate: new Date(courseData.startDate as string),
            endDate: new Date(courseData.endDate as string),
            duration: (courseData.duration as number) || 0,
            schedule: (courseData.schedule as string) || "",
            scheduleMm: (courseData.scheduleMm as string) || "",
            feeAmount: typeof courseData.feeAmount === 'number' && courseData.feeAmount >= 0 ? courseData.feeAmount : 0,
            ageMin: (courseData.ageMin as number) || null,
            ageMax: (courseData.ageMax as number) || null,
            document: (courseData.document as string) || "",
            documentMm: (courseData.documentMm as string) || "",
            availableDays: (courseData.availableDays as boolean[]) || [],
            outcomes: (courseData.outcomes as string[]) || [],
            outcomesMm: (courseData.outcomesMm as string[]) || [],
            scheduleDetails: (courseData.scheduleDetails as string) || "",
            scheduleDetailsMm: (courseData.scheduleDetailsMm as string) || "",
            selectionCriteria: (courseData.selectionCriteria as string[]) || [],
            selectionCriteriaMm: (courseData.selectionCriteriaMm as string[]) || [],
            howToApply: (courseData.howToApply as string[]) || [],
            howToApplyMm: (courseData.howToApplyMm as string[]) || [],
            applyButtonText: (courseData.applyButtonText as string) || "",
            applyButtonTextMm: (courseData.applyButtonTextMm as string) || "",
            applyLink: (courseData.applyLink as string) || "",
            estimatedDate: (courseData.estimatedDate as string) || "",
            estimatedDateMm: (courseData.estimatedDateMm as string) || "",
            organizationId: (courseData.organizationId as string) || updatedDraft.organizationId,
            updatedAt: new Date(),
            slug: slug,
          },
        });

        // Create badges if they exist
        if (courseData.badges && Array.isArray(courseData.badges)) {
          for (const badge of courseData.badges as Array<{text: string; color: string; backgroundColor: string}>) {
            await tx.badge.create({
              data: {
                id: crypto.randomUUID(),
                text: badge.text,
                color: badge.color,
                backgroundColor: badge.backgroundColor,
                courseId: courseId,
              },
            });
          }
        }

        // Create FAQ if they exist
        if (courseData.faq && Array.isArray(courseData.faq)) {
          for (const faq of courseData.faq as Array<{question: string; questionMm?: string; answer: string; answerMm?: string}>) {
            if (faq.question && faq.question.trim()) {
              await tx.fAQ.create({
                data: {
                  id: crypto.randomUUID(),
                  question: faq.question,
                  questionMm: faq.questionMm || "",
                  answer: faq.answer || "",
                  answerMm: faq.answerMm || "",
                  courseId: courseId,
                },
              });
            }
          }
        }

        // Create images if they exist in the draft
        if (courseData.imageUrls && Array.isArray(courseData.imageUrls)) {
          await tx.image.createMany({
            data: (courseData.imageUrls as string[]).map((url) => ({
              id: crypto.randomUUID(),
              url,
              courseId: courseId,
            })),
          });
        }

        return { updatedDraft, course };
      });

      return NextResponse.json({
        message: "Draft approved and course created successfully",
        draft: result.updatedDraft,
        course: result.course,
      });
    } else {
      // Just update the draft status (for rejections or other status changes)
      const updatedDraft = await prisma.contentDraft.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: reviewNotes?.trim() || null,
        },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Draft status updated successfully",
        draft: updatedDraft,
      });
    }
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}