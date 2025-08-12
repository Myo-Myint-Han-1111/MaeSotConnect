import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const invitations = await prisma.userInvitation.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        organizationId: true,
        invitedBy: true,
        invitedAt: true,
        expiresAt: true,
        notes: true,
        Organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, organizationId, notes } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { message: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { message: "Invalid role value" },
        { status: 400 }
      );
    }

    // Don't allow inviting platform admins (they should be added via allowlist)
    if (role === Role.PLATFORM_ADMIN) {
      return NextResponse.json(
        { message: "Platform admins must be added via the admin allowlist" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if there's already any invitation for this email
    const existingInvitation = await prisma.userInvitation.findUnique({
      where: {
        email,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { message: "An invitation for this email already exists" },
        { status: 400 }
      );
    }

    // Validate organization if provided
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { message: "Invalid organization selected" },
          { status: 400 }
        );
      }
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        role,
        organizationId: organizationId || null,
        invitedBy: session.user.id,
        expiresAt,
        notes,
      },
      include: {
        Organization: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Send email invitation here
    // You can integrate with your preferred email service (SendGrid, etc.)
    console.log(`Invitation created for ${email} with role ${role}`);

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}