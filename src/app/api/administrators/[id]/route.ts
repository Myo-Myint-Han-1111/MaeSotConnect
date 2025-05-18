import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { authOptions } from "@/lib/auth/auth";

// Input validation schema for updates
const updateAdministratorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.enum(["PLATFORM_ADMIN", "ORGANIZATION_ADMIN"]).optional(),
  organizationId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Platform admins can view any administrator, org admins can only view administrators in their organization
    if (session.user.role !== "PLATFORM_ADMIN") {
      // Check if administrator is from the same organization
      const administrator = await prisma.user.findUnique({
        where: { id },
        select: { organizationId: true },
      });

      if (!administrator || administrator.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const administrator = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!administrator) {
      return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
    }

    return NextResponse.json(administrator);
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
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    // Only platform admins can update administrators
    if (!session || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = updateAdministratorSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    // Check if administrator exists
    const existingAdministrator = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingAdministrator) {
      return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
    }

    const { name, email, password, role, organizationId } = parsedData.data;

    // For organization admins, organization ID is required
    if (role === "ORGANIZATION_ADMIN" && organizationId === null) {
      return NextResponse.json(
        { error: "Organization ID is required for Organization Admins" },
        { status: 400 }
      );
    }

    // If organizationId is provided, verify it exists
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 400 }
        );
      }
    }

    // Prepare update data with explicit typing
    interface UpdateData {
      name?: string;
      email?: string;
      password?: string;
      role?: "PLATFORM_ADMIN" | "ORGANIZATION_ADMIN";
      organizationId?: string | null;
    }

    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);
    if (role) updateData.role = role;
    if (organizationId !== undefined)
      updateData.organizationId = organizationId;

    // Update the administrator
    const updatedAdministrator = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Return the updated administrator without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: passwordField, ...administratorWithoutPassword } = updatedAdministrator;
    return NextResponse.json(administratorWithoutPassword);
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
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    // Only platform admins can delete administrators
    if (!session || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if administrator exists
    const existingAdministrator = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingAdministrator) {
      return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (existingAdministrator.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the administrator
    await prisma.user.delete({
      where: { id },
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