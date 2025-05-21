// src/app/api/organizations/route.ts
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
  latitude: z
    .number()
    .refine((val) => !isNaN(val), "Latitude must be a valid number"),
  longitude: z
    .number()
    .refine((val) => !isNaN(val), "Longitude must be a valid number"),
  district: z.string().optional(), // New field
  province: z.string().optional(), // New field
});

export async function GET(request: NextRequest) {
  try {
    // Get current session to check permissions
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Only platform admins can list all organizations
    if (session.user.role !== "PLATFORM_ADMIN") {
      // If organization admin, only return their organization
      if (
        session.user.role === "ORGANIZATION_ADMIN" &&
        session.user.organizationId
      ) {
        const organization = await prisma.organization.findUnique({
          where: { id: session.user.organizationId },
        });

        return NextResponse.json([organization]);
      }

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
    const body = await request.json();
    console.log("Organization creation request body:", body);

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
