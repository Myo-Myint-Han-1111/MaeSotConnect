import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const profiles = await prisma.advocateProfile.findMany({
      where: {
        status: "APPROVED"
      },
      include: {
        user: {
          select: {
            name: true,
            organization: {
              select: {
                name: true
              }
            },
            createdCourses: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Transform the data for public consumption and calculate stats
    const publicProfiles = profiles.map(profile => ({
      id: profile.id,
      publicName: profile.publicName || "Anonymous Youth Advocate",
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      showOrganization: profile.showOrganization,
      organizationName: profile.showOrganization ? profile.user.organization?.name : null,
      courseCount: profile.user.createdCourses.length
    }));

    // Sort by course count (descending) then by name for consistent ranking
    const sortedProfiles = publicProfiles.sort((a, b) => {
      if (b.courseCount !== a.courseCount) {
        return b.courseCount - a.courseCount;
      }
      return a.publicName.localeCompare(b.publicName);
    });

    return NextResponse.json(sortedProfiles);
  } catch (error) {
    console.error("Error fetching public profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}