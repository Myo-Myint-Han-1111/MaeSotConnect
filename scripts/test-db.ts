import { PrismaClient } from "@prisma/client";
import { CourseFromDB } from "@/types";

const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch courses with all required relations
    const courses: CourseFromDB[] = await prisma.course.findMany({
      include: {
        images: true,
        badges: true,
        faq: true,
        organizationInfo: true,
      },
    });

    // Log the count and first course details for verification
    console.log(
      `Database connection successful! Found ${courses.length} courses.`
    );

    if (courses.length > 0) {
      console.log("First course details:");
      console.log(JSON.stringify(courses[0], null, 2));
    }
  } catch (error) {
    console.error("Database connection or query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
