// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Simple query that should work if connection is successful
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    return NextResponse.json({
      status: "Connected",
      result,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "Failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
