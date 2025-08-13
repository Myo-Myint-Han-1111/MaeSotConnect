import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { DraftStatus } from "@/lib/auth/roles";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Get the original draft
    const originalDraft = await prisma.contentDraft.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!originalDraft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Check if the user can copy this draft (owner or same organization)
    const canCopy = 
      originalDraft.createdBy === session.user.id ||
      (session.user.organizationId && originalDraft.organizationId === session.user.organizationId);

    if (!canCopy) {
      return NextResponse.json(
        { message: "You don't have permission to copy this draft" },
        { status: 403 }
      );
    }

    // Create a copy of the draft
    const copiedDraft = await prisma.contentDraft.create({
      data: {
        title: `Copy of ${originalDraft.title}`,
        type: originalDraft.type,
        content: originalDraft.content as object,
        status: DraftStatus.DRAFT, // Always start as draft
        createdBy: session.user.id, // New owner is the current user
        organizationId: session.user.organizationId || null,
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

    return NextResponse.json({
      message: "Draft copied successfully",
      draft: copiedDraft,
    });
  } catch (error) {
    console.error("Error copying draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}