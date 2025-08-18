import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all approved profiles with course counts
    const profiles = await prisma.advocateProfile.findMany({
      where: {
        status: "APPROVED"
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdCourses: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Transform and sort profiles by course count (same logic as public API)
    const rankedProfiles = profiles.map(profile => ({
      userId: profile.user.id,
      email: profile.user.email,
      publicName: profile.publicName || "Anonymous Youth Advocate",
      courseCount: profile.user.createdCourses.length
    }));

    // Sort by course count (descending) then by name for consistent ranking
    rankedProfiles.sort((a, b) => {
      if (b.courseCount !== a.courseCount) {
        return b.courseCount - a.courseCount;
      }
      return a.publicName.localeCompare(b.publicName);
    });

    // Find current user's rank
    const currentUserIndex = rankedProfiles.findIndex(
      profile => profile.email === session.user.email
    );

    if (currentUserIndex === -1) {
      // User doesn't have an approved profile yet
      return NextResponse.json({
        rank: null,
        totalAdvocates: rankedProfiles.length,
        courseCount: 0,
        hasProfile: false
      });
    }

    const currentUserProfile = rankedProfiles[currentUserIndex];
    
    return NextResponse.json({
      rank: currentUserIndex + 1, // Convert to 1-based ranking
      totalAdvocates: rankedProfiles.length,
      courseCount: currentUserProfile.courseCount,
      hasProfile: true
    });

  } catch (error) {
    console.error("Error fetching user rank:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}