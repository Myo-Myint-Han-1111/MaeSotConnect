// src/app/api/admin/allowlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";

import { Role } from "@prisma/client";

// Input validation schema
const adminSchema = z.object({
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
});

// GET: List all admins in the allowlist
export async function GET() {
  try {
    const session = await auth();

    // Only platform admins can access this endpoint
    if (!session || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all admin allowlist entries
    const allowList = await prisma.adminAllowList.findMany({
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json(allowList);
  } catch (error) {
    console.error("Error fetching admin allowlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin allowlist" },
      { status: 500 }
    );
  }
}

// POST: Add a new admin to the allowlist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Only platform admins can access this endpoint
    if (!session || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = adminSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { email, notes } = parsedData.data;

    // Check if email already exists in allowlist
    const existingAllowlistEntry = await prisma.adminAllowList.findUnique({
      where: { email },
    });

    if (existingAllowlistEntry) {
      return NextResponse.json(
        { error: "Email already in allowlist" },
        { status: 400 }
      );
    }

    // Create the allowlist entry
    const adminEntry = await prisma.adminAllowList.create({
      data: {
        email,
        notes,
        addedBy: session.user.id,
      },
    });

    // If the user already exists, update their role to PLATFORM_ADMIN
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: Role.PLATFORM_ADMIN },
      });
    }

    return NextResponse.json(adminEntry, { status: 201 });
  } catch (error) {
    console.error("Error adding to admin allowlist:", error);
    return NextResponse.json(
      { error: "Failed to add to admin allowlist" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an admin from the allowlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    // Only platform admins can access this endpoint
    if (!session || session.user.role !== Role.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the ID from the query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });
    }

    // Check if it's the last admin in the system
    const adminCount = await prisma.user.count({
      where: { role: Role.PLATFORM_ADMIN },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last platform admin" },
        { status: 400 }
      );
    }

    // Find the admin to get the email
    const admin = await prisma.adminAllowList.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Delete the allowlist entry
    await prisma.adminAllowList.delete({
      where: { id },
    });

    // Note: We do NOT downgrade existing users automatically
    // This is a security decision - removing from allowlist only prevents new admins

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from admin allowlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from admin allowlist" },
      { status: 500 }
    );
  }
}
