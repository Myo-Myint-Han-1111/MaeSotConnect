import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth";

// Input validation schema
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phone: z.string().min(5, "Phone must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  facebookPage: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
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

    const body = await request.json();
    const parsedData = organizationSchema.safeParse(body);

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
    } = parsedData.data;

    // Create the organization
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
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
