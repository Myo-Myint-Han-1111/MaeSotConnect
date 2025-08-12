import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/auth/roles";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            users: true,
            courses: true,
            invitations: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}