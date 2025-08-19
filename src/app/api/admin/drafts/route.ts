// src/app/api/admin/drafts/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get current session to check permissions
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can list all drafts
    if (session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get only submitted drafts (not user drafts still being worked on)
    const drafts = await prisma.contentDraft.findMany({
      where: {
        status: {
          in: ["PENDING", "REJECTED"], // Only show drafts that need admin attention
        },
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
      orderBy: [
        { status: "asc" }, // PENDING first, then REJECTED
        { submittedAt: "desc" }, // Most recent first within each status
      ],
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts for admin:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch drafts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}