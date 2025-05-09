import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { authOptions } from "@/lib/auth/auth";

// Input validation schema
const updateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; adminId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const organizationId = resolvedParams.id;
    const adminId = resolvedParams.adminId;

    const session = await getServerSession(authOptions);

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Must be organization admin of this organization
    if (
      (session.user.role !== "ORGANIZATION_ADMIN" &&
        session.user.role !== "PLATFORM_ADMIN") ||
      (session.user.role === "ORGANIZATION_ADMIN" &&
        session.user.organizationId !== organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the admin
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId,
        role: "ORGANIZATION_ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Administrator not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching administrator:", error);
    return NextResponse.json(
      { error: "Failed to fetch administrator" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; adminId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const organizationId = resolvedParams.id;
    const adminId = resolvedParams.adminId;

    const session = await getServerSession(authOptions);

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Must be organization admin of this organization
    if (
      (session.user.role !== "ORGANIZATION_ADMIN" &&
        session.user.role !== "PLATFORM_ADMIN") ||
      (session.user.role === "ORGANIZATION_ADMIN" &&
        session.user.organizationId !== organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if admin exists and belongs to this organization
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId,
        role: "ORGANIZATION_ADMIN",
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Administrator not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsedData = updateAdminSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsedData.data;

    // Prepare update data
    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    // Update the admin
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating administrator:", error);
    return NextResponse.json(
      { error: "Failed to update administrator" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; adminId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const organizationId = resolvedParams.id;
    const adminId = resolvedParams.adminId;

    const session = await getServerSession(authOptions);

    // Must be authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Must be organization admin of this organization
    if (
      (session.user.role !== "ORGANIZATION_ADMIN" &&
        session.user.role !== "PLATFORM_ADMIN") ||
      (session.user.role === "ORGANIZATION_ADMIN" &&
        session.user.organizationId !== organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if admin exists and belongs to this organization
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId,
        role: "ORGANIZATION_ADMIN",
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Administrator not found" },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (adminId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself as an administrator" },
        { status: 400 }
      );
    }

    // Delete the admin (or update to remove organization association)
    await prisma.user.update({
      where: { id: adminId },
      data: {
        organizationId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting administrator:", error);
    return NextResponse.json(
      { error: "Failed to delete administrator" },
      { status: 500 }
    );
  }
}
