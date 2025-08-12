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

    // Get all drafts with author and organization information
    const drafts = await prisma.contentDraft.findMany({
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
        { status: "asc" }, // PENDING first, then others
        { submittedAt: "desc" }, // Most recent first within each status
      ],
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}