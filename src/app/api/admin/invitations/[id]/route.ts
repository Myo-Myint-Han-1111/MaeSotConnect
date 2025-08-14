import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role, InvitationStatus } from "@/lib/auth/roles";

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

    // Check if invitation exists
    const invitation = await prisma.userInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    // Allow deleting pending and expired invitations, but not accepted ones
    if (invitation.status === InvitationStatus.ACCEPTED) {
      return NextResponse.json(
        { message: "Cannot delete accepted invitations" },
        { status: 400 }
      );
    }

    // Completely delete the invitation record
    await prisma.userInvitation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invitation deleted successfully" });
  } catch (error) {
    console.error("Error revoking invitation:", error);
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

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notes, expiresAt } = body;

    const { id } = await params;

    // Check if invitation exists
    const invitation = await prisma.userInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    // Only allow updating pending invitations
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { message: "Can only update pending invitations" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
    }

    // Update invitation
    const updatedInvitation = await prisma.userInvitation.update({
      where: { id },
      data: updateData,
      include: {
        Organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedInvitation);
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}