import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || 
        (session.user.role !== Role.PLATFORM_ADMIN && session.user.role !== Role.ORGANIZATION_ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }

    // Organization admins can only see profiles from their organization
    if (session.user.role === Role.ORGANIZATION_ADMIN && session.user.organizationId) {
      where.user = {
        organizationId: session.user.organizationId,
      };
    }

    const [profiles, total] = await Promise.all([
      prisma.advocateProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            include: {
              organization: true,
            },
          },
        },
      }),
      prisma.advocateProfile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}