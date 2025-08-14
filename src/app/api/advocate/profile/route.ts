import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== Role.YOUTH_ADVOCATE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.advocateProfile.findUnique({
      where: { userId: session.user.id },
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

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== Role.YOUTH_ADVOCATE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { publicName, bio, avatarUrl, showOrganization, status = "DRAFT" } = body;

    // Check if profile already exists
    const existingProfile = await prisma.advocateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    const profile = await prisma.advocateProfile.create({
      data: {
        userId: session.user.id,
        publicName: publicName || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        showOrganization: Boolean(showOrganization),
        status,
        submittedAt: status === "PENDING" ? new Date() : null,
      },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}