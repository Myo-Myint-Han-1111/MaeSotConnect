import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, DraftStatus } from "@/lib/auth/roles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const draft = await prisma.contentDraft.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Check permissions
    const canAccess = 
      session.user.role === Role.PLATFORM_ADMIN ||
      draft.createdBy === session.user.id ||
      (session.user.role === Role.ORGANIZATION_ADMIN && 
       session.user.organizationId === draft.organizationId);

    if (!canAccess) {
      return NextResponse.json(
        { message: "You don't have permission to access this draft" },
        { status: 403 }
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, status, reviewNotes } = body;

    const { id } = await params;

    const draft = await prisma.contentDraft.findUnique({
      where: { id },
    });

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Check permissions for editing
    const canEdit = 
      draft.createdBy === session.user.id && 
      [DraftStatus.DRAFT, DraftStatus.REJECTED].includes(draft.status as DraftStatus);

    // Check permissions for reviewing
    const canReview = 
      (session.user.role === Role.PLATFORM_ADMIN ||
       (session.user.role === Role.ORGANIZATION_ADMIN && 
        session.user.organizationId === draft.organizationId)) &&
      draft.status === DraftStatus.PENDING;

    if (!canEdit && !canReview) {
      return NextResponse.json(
        { message: "You don't have permission to modify this draft" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Handle editing by creator
    if (canEdit) {
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (status !== undefined) {
        if (![DraftStatus.DRAFT, DraftStatus.PENDING].includes(status)) {
          return NextResponse.json(
            { message: "Invalid status for draft update" },
            { status: 400 }
          );
        }
        updateData.status = status;
        if (status === DraftStatus.PENDING) {
          updateData.submittedAt = new Date();
        }
      }
    }

    // Handle reviewing by admin
    if (canReview && status !== undefined) {
      if (![DraftStatus.APPROVED, DraftStatus.REJECTED].includes(status)) {
        return NextResponse.json(
          { message: "Invalid status for draft review" },
          { status: 400 }
        );
      }
      
      updateData.status = status;
      updateData.reviewedBy = session.user.id;
      updateData.reviewedAt = new Date();
      
      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }
    }

    const updatedDraft = await prisma.contentDraft.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const draft = await prisma.contentDraft.findUnique({
      where: { id },
    });

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Only the creator can delete their drafts, and only if not approved
    const canDelete = 
      draft.createdBy === session.user.id && 
      draft.status !== DraftStatus.APPROVED;

    if (!canDelete) {
      return NextResponse.json(
        { message: "You don't have permission to delete this draft" },
        { status: 403 }
      );
    }

    await prisma.contentDraft.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}