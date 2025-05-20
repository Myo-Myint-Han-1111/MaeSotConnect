import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const organizationId = resolvedParams.id;

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Check permissions - platform admin can access any, org admin only their own
    if (
      session.user.role !== "PLATFORM_ADMIN" &&
      (session.user.role !== "ORGANIZATION_ADMIN" ||
        session.user.organizationId !== organizationId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get organization admins
    const admins = await prisma.user.findMany({
      where: {
        organizationId: organizationId,
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

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching organization admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization admins" },
      { status: 500 }
    );
  }
}
