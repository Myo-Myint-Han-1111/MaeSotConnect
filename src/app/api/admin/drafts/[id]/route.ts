// src/app/api/admin/drafts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { DraftStatus } from "@/lib/auth/roles";
import { generateOrganizationSlug } from "@/lib/slugs";

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

    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes, content } = body;

    // If no status is provided, this is just a content update
    if (!status) {
      if (!content) {
        return NextResponse.json(
          { error: "Content is required for updates" },
          { status: 400 }
        );
      }

      const updatedDraft = await prisma.contentDraft.update({
        where: { id },
        data: {
          content: content,
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
        message: "Draft content updated successfully",
        draft: updatedDraft,
      });
    }

    // Validate status
    if (!Object.values(DraftStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Require review notes for rejections
    if (
      status === DraftStatus.REJECTED &&
      (!reviewNotes || !reviewNotes.trim())
    ) {
      return NextResponse.json(
        { error: "Review notes are required for rejections" },
        { status: 400 }
      );
    }

    // Get the draft to check if it exists
    const existingDraft = await prisma.contentDraft.findUnique({
      where: { id },
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // If approving, create the course or organization
    if (status === DraftStatus.APPROVED) {
      // Start a transaction with longer timeout to handle complex course creations
      const result = await prisma.$transaction(
        async (tx) => {
          // Get the draft content for creation (we'll delete the draft after creating the entity)
          const draftContent = content || existingDraft.content;

          // Create organization or course based on draft type
          if (existingDraft.type === "ORGANIZATION") {
            // Create organization from the draft content
            const orgData = draftContent as Record<string, unknown>;

            // Generate a unique slug for the organization
            const orgId = crypto.randomUUID();
            const baseSlug = generateOrganizationSlug(
              orgData.name as string,
              orgId
            );
            let slug = baseSlug;
            let counter = 1;

            while (await tx.organization.findUnique({ where: { slug } })) {
              slug = `${baseSlug}-${counter}`;
              counter++;
            }

            const organization = await tx.organization.create({
              data: {
                id: orgId,
                name: (orgData.name as string) || "",
                description: (orgData.description as string) || "",
                phone: (orgData.phone as string) || "",
                email: (orgData.email as string) || "",
                address: (orgData.address as string) || "",
                facebookPage: (orgData.facebookPage as string) || "",
                latitude: (orgData.latitude as number) || 0,
                longitude: (orgData.longitude as number) || 0,
                district: (orgData.district as string) || "",
                province: (orgData.province as string) || "",
                logoImage: (orgData.logoImageUrl as string) || null,
                slug: slug,
              },
            });

            // Delete the draft since organization has been created
            await tx.contentDraft.delete({
              where: { id },
            });

            return { organization };
          } else {
            // Handle COURSE type drafts
            const courseData = draftContent as Record<string, unknown>;

            if (existingDraft.originalCourseId) {
              // 🎯 THIS IS A COURSE EDIT - UPDATE THE ORIGINAL COURSE

              // First, delete existing related data
              await tx.badge.deleteMany({
                where: { courseId: existingDraft.originalCourseId },
              });

              await tx.fAQ.deleteMany({
                where: { courseId: existingDraft.originalCourseId },
              });

              await tx.image.deleteMany({
                where: { courseId: existingDraft.originalCourseId },
              });

              // Update the original course with all new data
              await tx.course.update({
                where: { id: existingDraft.originalCourseId },
                data: {
                  title: (courseData.title as string) || "",
                  titleMm: (courseData.titleMm as string) || null,
                  subtitle: (courseData.subtitle as string) || "",
                  subtitleMm: (courseData.subtitleMm as string) || null,
                  description: (courseData.description as string) || null,
                  descriptionMm: (courseData.descriptionMm as string) || null,
                  province: (courseData.province as string) || null,
                  district: (courseData.district as string) || null,
                  address: (courseData.address as string) || null,
                  applyByDate: courseData.applyByDate
                    ? new Date(courseData.applyByDate as string)
                    : null,
                  applyByDateMm: courseData.applyByDateMm
                    ? new Date(courseData.applyByDateMm as string)
                    : null,
                  startByDate: courseData.startByDate
                    ? new Date(courseData.startByDate as string)
                    : null,
                  startByDateMm: courseData.startByDateMm
                    ? new Date(courseData.startByDateMm as string)
                    : null,
                  startDate: new Date(courseData.startDate as string),
                  endDate: new Date(courseData.endDate as string),
                  duration: (courseData.duration as number) || 0,
                  schedule: (courseData.schedule as string) || "",
                  scheduleMm: (courseData.scheduleMm as string) || null,
                  feeAmount:
                    typeof courseData.feeAmount === "number" &&
                    courseData.feeAmount >= 0
                      ? courseData.feeAmount
                      : 0,
                  ageMin: (courseData.ageMin as number) || null,
                  ageMax: (courseData.ageMax as number) || null,
                  document: (courseData.document as string) || null,
                  documentMm: (courseData.documentMm as string) || null,
                  availableDays: (courseData.availableDays as boolean[]) || [],
                  outcomes: (courseData.outcomes as string[]) || [],
                  outcomesMm: (courseData.outcomesMm as string[]) || [],
                  scheduleDetails:
                    (courseData.scheduleDetails as string) || null,
                  scheduleDetailsMm:
                    (courseData.scheduleDetailsMm as string) || null,
                  selectionCriteria:
                    (courseData.selectionCriteria as string[]) || [],
                  selectionCriteriaMm:
                    (courseData.selectionCriteriaMm as string[]) || [],
                  howToApply: (courseData.howToApply as string[]) || [],
                  howToApplyMm: (courseData.howToApplyMm as string[]) || [],
                  applyButtonText:
                    (courseData.applyButtonText as string) || null,
                  applyButtonTextMm:
                    (courseData.applyButtonTextMm as string) || null,
                  applyLink: (courseData.applyLink as string) || null,
                  estimatedDate: (courseData.estimatedDate as string) || null,
                  estimatedDateMm:
                    (courseData.estimatedDateMm as string) || null,
                  updatedAt: new Date(),
                  // 🎯 Try to restore to PUBLISHED if status field exists
                  ...((await checkFieldExists(tx, "Course", "status")) && {
                    status: "PUBLISHED",
                  }),
                },
              });

              // Recreate related data from the draft
              if (courseData.badges && Array.isArray(courseData.badges)) {
                const badges = courseData.badges as Array<{
                  id?: string;
                  text: string;
                  color: string;
                  backgroundColor: string;
                }>;

                if (badges.length > 0) {
                  await tx.badge.createMany({
                    data: badges.map((badge) => ({
                      id: badge.id || crypto.randomUUID(),
                      text: badge.text,
                      color: badge.color,
                      backgroundColor: badge.backgroundColor,
                      courseId: existingDraft.originalCourseId!,
                    })),
                  });
                }
              }

              if (courseData.faq && Array.isArray(courseData.faq)) {
                const faqs = (
                  courseData.faq as Array<{
                    id?: string;
                    question: string;
                    questionMm?: string;
                    answer: string;
                    answerMm?: string;
                  }>
                ).filter((faq) => faq.question && faq.question.trim());

                if (faqs.length > 0) {
                  await tx.fAQ.createMany({
                    data: faqs.map((faq) => ({
                      id: faq.id || crypto.randomUUID(),
                      question: faq.question,
                      questionMm: faq.questionMm || null,
                      answer: faq.answer || "",
                      answerMm: faq.answerMm || null,
                      courseId: existingDraft.originalCourseId!,
                    })),
                  });
                }
              }

              if (courseData.imageUrls && Array.isArray(courseData.imageUrls)) {
                const imageUrls = courseData.imageUrls as string[];
                if (imageUrls.length > 0) {
                  await tx.image.createMany({
                    data: imageUrls.map((url) => ({
                      id: crypto.randomUUID(),
                      url,
                      courseId: existingDraft.originalCourseId!,
                    })),
                  });
                }
              }

              // Don't delete the draft here - we'll update it below
              return {
                updatedCourse: true,
                courseId: existingDraft.originalCourseId,
              };
            } else {
              // 🎯 THIS IS A NEW COURSE - CREATE IT (your existing logic)

              // Generate course ID
              const courseId = crypto.randomUUID();

              // Generate a unique slug
              const baseSlug = ((courseData.title as string) || "course")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
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
                  titleMm: (courseData.titleMm as string) || null,
                  subtitle: (courseData.subtitle as string) || "",
                  subtitleMm: (courseData.subtitleMm as string) || null,
                  description: (courseData.description as string) || null,
                  descriptionMm: (courseData.descriptionMm as string) || null,
                  province: (courseData.province as string) || null,
                  district: (courseData.district as string) || null,
                  address: (courseData.address as string) || null,
                  applyByDate: courseData.applyByDate
                    ? new Date(courseData.applyByDate as string)
                    : null,
                  applyByDateMm: courseData.applyByDateMm
                    ? new Date(courseData.applyByDateMm as string)
                    : null,
                  startByDate: courseData.startByDate
                    ? new Date(courseData.startByDate as string)
                    : null,
                  startByDateMm: courseData.startByDateMm
                    ? new Date(courseData.startByDateMm as string)
                    : null,
                  startDate: new Date(courseData.startDate as string),
                  endDate: new Date(courseData.endDate as string),
                  duration: (courseData.duration as number) || 0,
                  schedule: (courseData.schedule as string) || "",
                  scheduleMm: (courseData.scheduleMm as string) || null,
                  feeAmount:
                    typeof courseData.feeAmount === "number" &&
                    courseData.feeAmount >= 0
                      ? courseData.feeAmount
                      : 0,
                  ageMin: (courseData.ageMin as number) || null,
                  ageMax: (courseData.ageMax as number) || null,
                  document: (courseData.document as string) || null,
                  documentMm: (courseData.documentMm as string) || null,
                  availableDays: (courseData.availableDays as boolean[]) || [],
                  outcomes: (courseData.outcomes as string[]) || [],
                  outcomesMm: (courseData.outcomesMm as string[]) || [],
                  scheduleDetails:
                    (courseData.scheduleDetails as string) || null,
                  scheduleDetailsMm:
                    (courseData.scheduleDetailsMm as string) || null,
                  selectionCriteria:
                    (courseData.selectionCriteria as string[]) || [],
                  selectionCriteriaMm:
                    (courseData.selectionCriteriaMm as string[]) || [],
                  howToApply: (courseData.howToApply as string[]) || [],
                  howToApplyMm: (courseData.howToApplyMm as string[]) || [],
                  applyButtonText:
                    (courseData.applyButtonText as string) || null,
                  applyButtonTextMm:
                    (courseData.applyButtonTextMm as string) || null,
                  applyLink: (courseData.applyLink as string) || null,
                  estimatedDate: (courseData.estimatedDate as string) || null,
                  estimatedDateMm:
                    (courseData.estimatedDateMm as string) || null,
                  organizationId:
                    (courseData.organizationId as string) ||
                    existingDraft.organizationId,
                  createdBy: existingDraft.createdBy,
                  updatedAt: new Date(),
                  slug: slug,
                  // 🎯 Set to PUBLISHED if status field exists
                  ...((await checkFieldExists(tx, "Course", "status"))
                    ? { status: "PUBLISHED" }
                    : {}),
                },
              });

              // Create badges if they exist - use createMany for better performance
              if (courseData.badges && Array.isArray(courseData.badges)) {
                const badges = courseData.badges as Array<{
                  text: string;
                  color: string;
                  backgroundColor: string;
                }>;

                if (badges.length > 0) {
                  await tx.badge.createMany({
                    data: badges.map((badge) => ({
                      id: crypto.randomUUID(),
                      text: badge.text,
                      color: badge.color,
                      backgroundColor: badge.backgroundColor,
                      courseId: courseId,
                    })),
                  });
                }
              }

              // Create FAQ if they exist - use createMany for better performance
              if (courseData.faq && Array.isArray(courseData.faq)) {
                const faqs = (
                  courseData.faq as Array<{
                    question: string;
                    questionMm?: string;
                    answer: string;
                    answerMm?: string;
                  }>
                ).filter((faq) => faq.question && faq.question.trim());

                if (faqs.length > 0) {
                  await tx.fAQ.createMany({
                    data: faqs.map((faq) => ({
                      id: crypto.randomUUID(),
                      question: faq.question,
                      questionMm: faq.questionMm || "",
                      answer: faq.answer || "",
                      answerMm: faq.answerMm || "",
                      courseId: courseId,
                    })),
                  });
                }
              }

              // Create images if they exist in the draft
              if (courseData.imageUrls && Array.isArray(courseData.imageUrls)) {
                const imageUrls = courseData.imageUrls as string[];
                if (imageUrls.length > 0) {
                  await tx.image.createMany({
                    data: imageUrls.map((url) => ({
                      id: crypto.randomUUID(),
                      url,
                      courseId: courseId,
                    })),
                  });
                }
              }

              // Delete the draft since course has been created
              await tx.contentDraft.delete({
                where: { id },
              });

              return { course };
            }
          }
        },
        {
          timeout: 15000, // 15 seconds timeout for complex course creation
        }
      );

      // 🎯 DELETE the draft after approval (both new courses and edits)
      await prisma.contentDraft.delete({
        where: { id },
      });

      const message = result.organization
        ? "Draft approved and organization created successfully"
        : result.updatedCourse
        ? "Draft approved and course updated successfully"
        : "Draft approved and course created successfully";

      return NextResponse.json({
        message,
        course: result.course,
        organization: result.organization,
      });
    } else {
      // If rejecting a course edit, restore original course status
      if (
        status === DraftStatus.REJECTED &&
        existingDraft?.type === "COURSE" &&
        existingDraft?.originalCourseId
      ) {
        try {
          if (await checkFieldExists(prisma, "Course", "status")) {
            await prisma.course.update({
              where: { id: existingDraft.originalCourseId },
              data: {
                status: "PUBLISHED",
                updatedAt: new Date(),
              },
            });
          }
        } catch (_error) {
          console.log("Could not restore course status:", _error);
        }
      }
      // Just update the draft status (for rejections or other status changes)
      const updatedDraft = await prisma.contentDraft.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: reviewNotes?.trim() || null,
          content: content || existingDraft.content, // Use provided content or existing
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

async function checkFieldExists(
  client: {
    $queryRaw: (
      query: TemplateStringsArray,
      ...values: unknown[]
    ) => Promise<unknown>;
  },
  tableName: string,
  fieldName: string
): Promise<boolean> {
  try {
    // Use Prisma.sql for safe SQL queries
    if (tableName === "Course" && fieldName === "status") {
      await client.$queryRaw`SELECT status FROM "Course" LIMIT 1`;
    }
    return true;
  } catch (_error) {
    return false;
  }
}
