// app/api/org-admin/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizationId?: string | null;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== Role.ORGANIZATION_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = session.user as SessionUser;

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "No organization assigned" },
        { status: 400 }
      );
    }

    // Get only the organization that belongs to this admin
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Return as an array to match the expected format from YouthAdvocateCourseForm
    return NextResponse.json([organization]);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
