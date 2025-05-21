import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Updated validation schema to include new fields
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phone: z.string().min(5, "Phone must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  facebookPage: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  district: z.string().optional(), // New field
  province: z.string().optional(), // New field
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

    // Check permissions - platform admin can access any, org admin only their own
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        session.user.organizationId !== params.id)
    ) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await auth();

    // Only platform admins can update organizations
    if (!session || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = organizationSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      facebookPage,
      latitude,
      longitude,
      district, // New field
      province, // New field
    } = parsedData.data;

    // Update the organization with new fields
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
        phone,
        email,
        address,
        facebookPage,
        latitude,
        longitude,
        district, // Include new field
        province, // Include new field
      },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
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

    // Only platform admins can delete organizations
    if (!session || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
      include: {
        courses: true,
        users: true,
      },
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if organization has any courses or users
    if (
      existingOrganization.courses.length > 0 ||
      existingOrganization.users.length > 0
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete organization with associated courses or users",
        },
        { status: 400 }
      );
    }

    // Delete the organization
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current session to check permissions
    const session = await auth();

    // Only platform admins can create organizations
    if (!session || session.user.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Starting organization creation...");
    const body = await request.json();
    console.log("Organization creation request body:", body);

    const parsedData = organizationSchema.safeParse(body);

    if (!parsedData.success) {
      console.log("Validation errors:", parsedData.error.errors);
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      facebookPage,
      latitude,
      longitude,
      district, // New field
      province, // New field
    } = parsedData.data;

    console.log("Creating organization with data:", parsedData.data);

    // Create the organization with new fields
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        phone,
        email,
        address,
        facebookPage,
        latitude,
        longitude,
        district, // Include new field
        province, // Include new field
      },
    });

    console.log("Organization created successfully:", organization);
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create organization", details: errorMessage },
      { status: 500 }
    );
  }
}
