// src/app/api/courses/badges/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get unique badge texts from upcoming courses only
    const badges = await prisma.badge.findMany({
      distinct: ["text"],
      select: {
        text: true,
      },
      where: {
        Course: {
          startDate: {
            gte: new Date(),
          },
        },
      },
    });

    const uniqueBadges = badges.map((badge) => badge.text);

    return NextResponse.json(uniqueBadges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
