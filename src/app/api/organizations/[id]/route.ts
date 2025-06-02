import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload"; // ADD THIS IMPORT

// Updated validation schema to include new fields
const organizationSchema = z.object({
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
  logoImage: z.string().optional(), // ADD THIS LINE
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

    // Check if organization exists first
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if request is FormData (has file) or JSON
    const contentType = request.headers.get("content-type");
    let body;
    let logoImageUrl: string | null = null;

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const jsonData = formData.get("data");

      if (!jsonData || typeof jsonData !== "string") {
        return NextResponse.json(
          { error: "Invalid form data" },
          { status: 400 }
        );
      }

      body = JSON.parse(jsonData);
      console.log("Organization update request body (FormData):", body);

      // Process logo image
      const logoImageFile = formData.get("logoImage");
      if (logoImageFile && logoImageFile instanceof File) {
        console.log("Processing logo image upload...");
        logoImageUrl = await saveFile(logoImageFile, undefined, "logo");
        console.log("Logo image uploaded:", logoImageUrl);
      }
    } else {
      // Handle JSON request (backward compatibility)
      body = await request.json();
      console.log("Organization update request body (JSON):", body);
    }

    // Make sure latitude and longitude are numbers
    const processedBody = {
      ...body,
      latitude:
        typeof body.latitude === "string"
          ? parseFloat(body.latitude)
          : body.latitude,
      longitude:
        typeof body.longitude === "string"
          ? parseFloat(body.longitude)
          : body.longitude,
    };

    const parsedData = organizationSchema.safeParse(processedBody);

    if (!parsedData.success) {
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
      district,
      province,
    } = parsedData.data;

    // Prepare update data with proper typing
    interface UpdateData {
      name: string;
      description: string;
      phone: string;
      email: string;
      address?: string;
      facebookPage?: string;
      latitude: number;
      longitude: number;
      district?: string;
      province?: string;
      logoImage?: string;
    }

    const updateData: UpdateData = {
      name,
      description,
      phone,
      email,
      address,
      facebookPage,
      latitude,
      longitude,
      district,
      province,
    };

    // Only update logoImage if a new one was uploaded
    if (logoImageUrl) {
      updateData.logoImage = logoImageUrl;
    }

    // Update the organization with new fields
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: updateData,
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

    // Check if organization has any courses or user
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
