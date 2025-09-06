// src/app/api/courses/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const isLegacy = searchParams.get('legacy') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24'); // 24 items per page for good mobile UX
    const search = searchParams.get('search') || '';
    const badges = searchParams.get('badges')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'startDate-asc';

    // Calculate pagination (skip for legacy mode)
    const skip = isLegacy ? 0 : (page - 1) * limit;
    
    // Build the where clause for filtering
    const whereClause: Prisma.CourseWhereInput = {
      // Only show courses that haven't started yet (future courses)
      startDate: {
        gte: new Date(), // Greater than or equal to today
      },
    };

    // Add search filtering
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleMm: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { organizationInfo: { name: { contains: search, mode: 'insensitive' } } },
        { badges: { some: { text: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Add badge filtering
    if (badges.length > 0) {
      whereClause.badges = {
        some: {
          text: { in: badges }
        }
      };
    }

    // Get total count for pagination metadata (only for non-legacy)
    const totalCount = isLegacy ? 0 : await prisma.course.count({ where: whereClause });

    const courses = await prisma.course.findMany({
      where: whereClause,
      ...(isLegacy ? {} : { skip, take: limit }),
      orderBy: getSortOrder(sortBy),
      select: {
        id: true,
        slug: true,
        title: true,
        titleMm: true,
        startDate: true,
        startDateMm: true,
        duration: true,
        durationUnit: true,
        durationMm: true,
        durationUnitMm: true,
        province: true,
        district: true,
        applyByDate: true,
        applyByDateMm: true,
        startByDate: true,
        startByDateMm: true,
        // fee/feeMm fields are replaced with feeAmount/feeAmountMm
        feeAmount: true,
        feeAmountMm: true,
        estimatedDate: true,
        estimatedDateMm: true,
        createdAt: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            advocateProfile: {
              select: {
                publicName: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        organizationInfo: {
          select: {
            id: true,
            name: true,
            description: true,
            phone: true,
            email: true,
            address: true,
            facebookPage: true,
            latitude: true,
            longitude: true,
            district: true,
            province: true,
            logoImage: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            courseId: true,
          },
        },
        badges: {
          select: {
            id: true,
            text: true,
            color: true,
            backgroundColor: true,
            courseId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response to ensure dates are serialized properly
    // and to maintain backward compatibility
    const formattedCourses = courses.map((course) => ({
      ...course,
      // Convert DateTime objects to ISO strings
      startDate: course.startDate.toISOString(),
      startDateMm: course.startDateMm ? course.startDateMm.toISOString() : null,
      applyByDate: course.applyByDate ? course.applyByDate.toISOString() : null,
      applyByDateMm: course.applyByDateMm
        ? course.applyByDateMm.toISOString()
        : null,
      startByDate: course.startByDate ? course.startByDate.toISOString() : null,
      startByDateMm: course.startByDateMm
        ? course.startByDateMm.toISOString()
        : null,
      estimatedDate: course.estimatedDate,
      estimatedDateMm: course.estimatedDateMm,
      createdAt: course.createdAt ? course.createdAt.toISOString() : null,
      // Build location from course district/province only
      location:
        [course.district, course.province].filter(Boolean).join(", ") || "",
      locationMm: null, // Keep for backward compatibility
      // Add empty fee fields for backward compatibility
      fee: course.feeAmount ? course.feeAmount.toString() : "",
      feeMm: course.feeAmountMm ? course.feeAmountMm.toString() : null,
    }));

    // Return response based on mode
    if (isLegacy) {
      return NextResponse.json(formattedCourses);
    }

    // Return paginated response with metadata
    const hasMore = skip + courses.length < totalCount;
    const response = {
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// Helper function to get sort order for Prisma query
function getSortOrder(sortBy: string) {
  switch (sortBy) {
    case 'startDate-desc':
      return { startDate: 'desc' as const };
    case 'applyByDate-asc':
      return { applyByDate: 'asc' as const };
    case 'applyByDate-desc':
      return { applyByDate: 'desc' as const };
    case 'default':
      return { createdAt: 'desc' as const };
    case 'startDate-asc':
    default:
      return { startDate: 'asc' as const };
  }
}
