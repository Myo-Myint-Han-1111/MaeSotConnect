// app/api/org-admin/profile/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";
import { z } from "zod";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

// Validation schema for organization update
const organizationUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phone: z.string().min(5, "Phone must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  facebookPage: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  district: z.string().optional(),
  province: z.string().optional(),
  logoImage: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Check if the organization belongs to the user
    if (user.organizationId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = organizationUpdateSchema.parse(body);

    // Update the organization
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address || null,
        facebookPage: validatedData.facebookPage || null,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        district: validatedData.district || null,
        province: validatedData.province || null,
        logoImage: validatedData.logoImage || null,
      },
    });

    return NextResponse.json({
      message: "Organization updated successfully",
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Check if the organization belongs to the user
    if (user.organizationId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
