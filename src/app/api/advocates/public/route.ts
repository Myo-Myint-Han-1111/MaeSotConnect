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
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform the data for public consumption
    const publicProfiles = profiles.map(profile => ({
      id: profile.id,
      publicName: profile.publicName || "Anonymous Youth Advocate",
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      showOrganization: profile.showOrganization,
      organizationName: profile.showOrganization ? profile.user.organization?.name : null
    }));

    return NextResponse.json(publicProfiles);
  } catch (error) {
    console.error("Error fetching public profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}