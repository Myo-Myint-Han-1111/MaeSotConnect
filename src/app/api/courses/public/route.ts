// src/app/api/courses/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const isLegacy = searchParams.get("legacy") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24"); // 24 items per page for good mobile UX
    const search = searchParams.get("search") || "";
    const badges = searchParams.get("badges")?.split(",").filter(Boolean) || [];
    const sortBy = searchParams.get("sortBy") || "startDate-asc";

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
        { title: { contains: search, mode: "insensitive" } },
        { titleMm: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { province: { contains: search, mode: "insensitive" } },
        {
          organizationInfo: { name: { contains: search, mode: "insensitive" } },
        },
        {
          badges: { some: { text: { contains: search, mode: "insensitive" } } },
        },
      ];
    }

    // Add badge filtering
    if (badges.length > 0) {
      whereClause.badges = {
        some: {
          text: { in: badges },
        },
      };
    }

    // Optimize: Use Promise.all for concurrent execution when needed
    let totalCount = 0;
    let courses;

    if (isLegacy) {
      courses = await prisma.course.findMany({
        where: whereClause,
        orderBy: getSortOrder(sortBy),
        select: {
          id: true,
          slug: true,
          title: true,
          titleMm: true,
          startDate: true,
          duration: true,
          durationUnit: true,
          durationUnitMm: true,
          province: true,
          district: true,
          applyByDate: true,
          startByDate: true,
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
              name: true, // Only organization name is used in CourseCard
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
            take: 10, // Limit badges for performance
          },
        },
      });
    } else {
      // Use Promise.all for concurrent execution of count and findMany
      [totalCount, courses] = await Promise.all([
        prisma.course.count({ where: whereClause }),
        prisma.course.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: getSortOrder(sortBy),
          select: {
            id: true,
            slug: true,
            title: true,
            titleMm: true,
            startDate: true,
            duration: true,
            durationUnit: true,
            durationUnitMm: true,
            province: true,
            district: true,
            applyByDate: true,
            startByDate: true,
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
                name: true,
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
              take: 10, // Limit badges for performance
            },
          },
        }),
      ]);
    }

    // Format the response to ensure dates are serialized properly
    // and to maintain backward compatibility
    const formattedCourses = courses.map((course) => ({
      ...course,
      // Convert DateTime objects to ISO strings
      startDate: course.startDate.toISOString(),
      applyByDate: course.applyByDate ? course.applyByDate.toISOString() : null,
      startByDate: course.startByDate ? course.startByDate.toISOString() : null,
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

    const nextResponse = NextResponse.json(response);

    // Add caching headers to reduce Fast Origin Transfer usage
    nextResponse.headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=300"
    ); // 1 hour cache, 5 min stale
    nextResponse.headers.set("CDN-Cache-Control", "public, max-age=3600");

    return nextResponse;
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
    case "startDate-desc":
      return { startDate: "desc" as const };
    case "applyByDate-asc":
      return { applyByDate: "asc" as const };
    case "applyByDate-desc":
      return { applyByDate: "desc" as const };
    case "default":
      return { createdAt: "desc" as const };
    case "startDate-asc":
    default:
      return { startDate: "asc" as const };
  }
}
