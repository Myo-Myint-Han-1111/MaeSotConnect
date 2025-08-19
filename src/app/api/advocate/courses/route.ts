import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch approved courses created by this user
    const courses = await prisma.course.findMany({
      where: {
        createdBy: session.user.id
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        organizationInfo: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      organizationName: course.organizationInfo?.name || null,
      isPublic: true, // All approved courses are public
      approvedAt: course.createdAt.toISOString()
    }));

    return NextResponse.json(formattedCourses);

  } catch (error) {
    console.error("Error fetching advocate courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}