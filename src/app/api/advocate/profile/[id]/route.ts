import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== Role.YOUTH_ADVOCATE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { publicName, bio, avatarUrl, showOrganization, status = "DRAFT" } = body;

    // Verify the profile belongs to the current user
    const resolvedParams = await params;
    const existingProfile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      publicName: publicName || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      showOrganization: Boolean(showOrganization),
      status,
    };

    // If changing from draft to pending, set submittedAt
    if (existingProfile.status === "DRAFT" && status === "PENDING") {
      updateData.submittedAt = new Date();
    }

    // If resubmitting after rejection, clear review data
    if (existingProfile.status === "REJECTED" && status === "PENDING") {
      updateData.submittedAt = new Date();
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;
      updateData.reviewNotes = null;
    }

    const profile = await prisma.advocateProfile.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    if (!session?.user?.id || session.user.role !== Role.YOUTH_ADVOCATE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Verify the profile belongs to the current user
    const resolvedParams = await params;
    const existingProfile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.advocateProfile.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    if (!session?.user?.id || session.user.role !== Role.YOUTH_ADVOCATE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the profile belongs to the current user
    const resolvedParams = await params;
    const existingProfile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.advocateProfile.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}