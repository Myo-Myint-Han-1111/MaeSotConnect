import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || 
        (session.user.role !== Role.PLATFORM_ADMIN && session.user.role !== Role.ORGANIZATION_ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const profile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Organization admins can only access profiles from their organization
    if (session.user.role === Role.ORGANIZATION_ADMIN) {
      if (session.user.organizationId !== profile.user.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get reviewer information if available
    let reviewedByUser = null;
    if (profile.reviewedBy) {
      reviewedByUser = await prisma.user.findUnique({
        where: { id: profile.reviewedBy },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    return NextResponse.json({
      ...profile,
      reviewedByUser,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
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

    if (!session?.user?.id || 
        (session.user.role !== Role.PLATFORM_ADMIN && session.user.role !== Role.ORGANIZATION_ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    if (!["APPROVED", "REJECTED", "HIDDEN"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const resolvedParams = await params;
    const profile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Organization admins can only review profiles from their organization
    if (session.user.role === Role.ORGANIZATION_ADMIN) {
      if (session.user.organizationId !== profile.user.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updatedProfile = await prisma.advocateProfile.update({
      where: { id: resolvedParams.id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error reviewing profile:", error);
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

    if (!session?.user?.id || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const profile = await prisma.advocateProfile.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
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