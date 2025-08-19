import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { DraftStatus } from "@/lib/auth/roles";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get draft counts
    const draftCounts = await prisma.contentDraft.groupBy({
      by: ['status'],
      where: {
        createdBy: session.user.id
      },
      _count: {
        status: true
      }
    });

    // Get approved course count
    const approvedCourseCount = await prisma.course.count({
      where: {
        createdBy: session.user.id
      }
    });

    // Process draft counts
    const draftStats = {
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    draftCounts.forEach((item) => {
      switch (item.status) {
        case DraftStatus.DRAFT:
          draftStats.draft = item._count.status;
          break;
        case DraftStatus.PENDING:
          draftStats.pending = item._count.status;
          break;
        case DraftStatus.APPROVED:
          draftStats.approved = item._count.status;
          break;
        case DraftStatus.REJECTED:
          draftStats.rejected = item._count.status;
          break;
      }
    });

    // Calculate total submissions (drafts + pending + approved courses)
    const totalSubmissions = draftStats.draft + draftStats.pending + approvedCourseCount;

    return NextResponse.json({
      drafts: draftStats,
      approvedCourses: approvedCourseCount,
      totalSubmissions
    });

  } catch (error) {
    console.error("Error fetching advocate stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}