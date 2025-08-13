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

    // Handle both JSON and FormData updates
    let title, content, status, reviewNotes;
    let imageUrls: string[] = [];

    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with images) - for draft updates
      const formData = await request.formData();
      const jsonData = formData.get("data");
      
      if (!jsonData || typeof jsonData !== "string") {
        return NextResponse.json(
          { message: "Invalid form data" },
          { status: 400 }
        );
      }

      const parsedData = JSON.parse(jsonData);
      title = parsedData.title;
      content = parsedData.content;
      status = parsedData.status;
      reviewNotes = parsedData.reviewNotes;

      // Process uploaded images
      const { saveFile } = await import("@/lib/upload");
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("image_") && value instanceof File) {
          const imageUrl = await saveFile(value, undefined, "course");
          imageUrls.push(imageUrl);
        }
      }

      // Merge new images with existing ones if they exist in content
      if (content?.imageUrls && Array.isArray(content.imageUrls)) {
        imageUrls = [...content.imageUrls, ...imageUrls];
      }

      // Update content with all images
      if (imageUrls.length > 0) {
        content.imageUrls = imageUrls;
      }
    } else {
      // Handle JSON updates (for admin reviews)
      const body = await request.json();
      title = body.title;
      content = body.content;
      status = body.status;
      reviewNotes = body.reviewNotes;
    }

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
      [DraftStatus.DRAFT, DraftStatus.REJECTED, DraftStatus.PENDING].includes(draft.status as DraftStatus);

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