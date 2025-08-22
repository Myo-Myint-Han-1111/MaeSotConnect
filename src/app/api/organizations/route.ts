// src/app/api/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOrganizationSlug } from "@/lib/slugs";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/upload";

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
  logoImage: z.string().optional(),
});

export async function GET() {
  try {
    // Get current session to check permissions
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Platform admins and youth advocates can list organizations
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      session.user.role !== "YOUTH_ADVOCATE"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
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
      console.log("Organization creation request body (FormData):", body);

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
      console.log("Organization creation request body (JSON):", body);
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

    console.log("Processed body:", processedBody);
    console.log("Latitude type:", typeof processedBody.latitude);
    console.log("Longitude type:", typeof processedBody.longitude);

    // Manually validate latitude and longitude are numbers and not NaN
    if (
      typeof processedBody.latitude !== "number" ||
      isNaN(processedBody.latitude)
    ) {
      return NextResponse.json(
        { error: "Latitude must be a valid number" },
        { status: 400 }
      );
    }

    if (
      typeof processedBody.longitude !== "number" ||
      isNaN(processedBody.longitude)
    ) {
      return NextResponse.json(
        { error: "Longitude must be a valid number" },
        { status: 400 }
      );
    }

    const parsedData = organizationSchema.safeParse(processedBody);

    if (!parsedData.success) {
      console.log("Validation errors:", parsedData.error.format());
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsedData.error.format(),
        },
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

    console.log("Creating organization with data:", parsedData.data);

    // Generate a unique slug for the organization
    const baseSlug = generateOrganizationSlug(name);

    // Ensure slug uniqueness by checking existing organizations
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log("Generated unique slug:", slug);

    // Create the organization with new fields including logoImage and slug
    const organization = await prisma.organization.create({
      data: {
        id: crypto.randomUUID(),
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
        logoImage: logoImageUrl || undefined,
        slug, // Add the generated slug
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
