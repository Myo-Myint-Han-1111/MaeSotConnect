// src/app/api/courses/badges/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get all unique badge texts from all courses
    const badges = await prisma.badge.findMany({
      distinct: ['text'],
      select: {
        text: true,
      },
    });

    const uniqueBadges = badges.map(badge => badge.text);
    
    return NextResponse.json(uniqueBadges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}