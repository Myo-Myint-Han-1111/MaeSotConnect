import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, UserStatus } from "@/lib/auth/roles";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!Object.values(UserStatus).includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent platform admins from suspending themselves
    if (user.email === session.user.email && status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { message: "Cannot suspend your own account" },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        organizationId: true,
        lastLoginAt: true,
        createdAt: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
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

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent platform admins from deleting themselves
    if (user.email === session.user.email) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if this is the last platform admin
    if (user.role === Role.PLATFORM_ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.PLATFORM_ADMIN },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "Cannot delete the last platform admin" },
          { status: 400 }
        );
      }
    }

    // Use a transaction to handle all related records before deletion
    await prisma.$transaction(async (tx) => {
      // Handle ContentDraft records created by this user
      await tx.contentDraft.deleteMany({
        where: { createdBy: id },
      });

      // Clean up references where this user was a reviewer
      await tx.contentDraft.updateMany({
        where: { reviewedBy: id },
        data: {
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
        },
      });

      // Handle AdvocateProfile records reviewed by this user
      await tx.advocateProfile.updateMany({
        where: { reviewedBy: id },
        data: {
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
        },
      });

      // Now delete the user (this will cascade delete accounts and sessions)
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);

    // Type guard for error handling
    const errorWithCode = error as { code?: string };

    // Provide specific error message for foreign key constraints
    if (errorWithCode.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "Cannot delete user due to existing related records. Please contact support.",
          error: "Foreign key constraint violation",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
