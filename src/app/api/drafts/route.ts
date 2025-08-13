import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, DraftStatus, DraftType } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let whereClause: Record<string, unknown> = {};

    // Platform admins can see all drafts, others only see their own or org-specific ones
    if (session.user.role === Role.PLATFORM_ADMIN) {
      // No additional filters - see all drafts
    } else if (session.user.role === Role.ORGANIZATION_ADMIN && session.user.organizationId) {
      // Org admins see drafts from their organization or drafts they created
      whereClause = {
        OR: [
          { organizationId: session.user.organizationId },
          { createdBy: session.user.id },
        ],
      };
    } else if (session.user.role === Role.YOUTH_ADVOCATE) {
      // Youth advocates only see their own drafts
      whereClause.createdBy = session.user.id;
    }

    // Apply filters
    if (status && Object.values(DraftStatus).includes(status as DraftStatus)) {
      whereClause.status = status;
    }

    if (type && Object.values(DraftType).includes(type as DraftType)) {
      whereClause.type = type;
    }

    const drafts = await prisma.contentDraft.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdBy: true,
        organizationId: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        reviewNotes: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only Youth Advocates and Organization Admins can create drafts
    if (![Role.YOUTH_ADVOCATE, Role.ORGANIZATION_ADMIN].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Only Youth Advocates and Organization Admins can create drafts" },
        { status: 403 }
      );
    }

    // Handle both JSON and FormData submissions
    let title, type, content, status = DraftStatus.DRAFT;
    const imageUrls: string[] = [];

    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with images)
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
      type = parsedData.type;
      content = parsedData.content;
      status = parsedData.status || DraftStatus.DRAFT;

      // Process uploaded images
      const { saveFile } = await import("@/lib/upload");
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("image_") && value instanceof File) {
          const imageUrl = await saveFile(value, undefined, "course");
          imageUrls.push(imageUrl);
        }
      }

      // Add image URLs to content
      if (imageUrls.length > 0) {
        content.imageUrls = imageUrls;
      }
    } else {
      // Handle JSON submissions (backward compatibility)
      const body = await request.json();
      title = body.title;
      type = body.type;
      content = body.content;
      status = body.status || DraftStatus.DRAFT;
    }

    // Validate required fields
    if (!title || !type || !content) {
      return NextResponse.json(
        { message: "Title, type, and content are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!Object.values(DraftType).includes(type)) {
      return NextResponse.json(
        { message: "Invalid draft type" },
        { status: 400 }
      );
    }

    // Validate status
    if (![DraftStatus.DRAFT, DraftStatus.PENDING].includes(status)) {
      return NextResponse.json(
        { message: "Can only create drafts with DRAFT or PENDING status" },
        { status: 400 }
      );
    }

    // Create draft
    const draft = await prisma.contentDraft.create({
      data: {
        title,
        type,
        content,
        status,
        createdBy: session.user.id,
        organizationId: session.user.organizationId || null,
        submittedAt: status === DraftStatus.PENDING ? new Date() : new Date(),
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}