import { PrismaClient } from "@prisma/client";
import { courseData } from "../src/data/courses";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // First, clear existing data
  await prisma.$transaction([
    prisma.fAQ.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.image.deleteMany(),
    prisma.course.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  console.log("Cleared existing data");

  for (const course of courseData) {
    console.log(`Creating course: ${course.title}`);

    // Create an organization if it exists
    let organizationId = null;
    if (course.organizationInfo) {
      try {
        const organization = await prisma.organization.create({
          data: {
            name: course.organizationInfo.name,
            description: course.organizationInfo.description,
            phone: course.organizationInfo.phone,
            email: course.organizationInfo.email,
            address: course.organizationInfo.address,
            facebookPage: course.organizationInfo.facebookPage,
            latitude: course.organizationInfo.mapLocation.lat,
            longitude: course.organizationInfo.mapLocation.lng,
          },
        });
        organizationId = organization.id;

        // Add detailed logging
        console.log(
          `Created organization: ${organization.name} with ID: ${organization.id}`
        );
      } catch (error) {
        console.error(
          `Failed to create organization for course ${course.title}:`,
          error
        );
      }
    } else {
      console.warn(`No organization info for course: ${course.title}`);
    }

    try {
      // Create the course with relationships
      const createdCourse = await prisma.course.create({
        data: {
          title: course.title,
          subtitle: course.subtitle,
          location: course.location,
          startDate: course.startDate,
          duration: course.duration,
          schedule: course.schedule,
          fee: course.fee,
          availableDays: course.availableDays,
          description: course.description || "",
          outcomes: course.outcomes || [],
          scheduleDetails: course.scheduleDetails || "",
          selectionCriteria: course.selectionCriteria || [],
          organizationId, // This can now be null if no organization was created

          // Create related records
          images: {
            create: course.images.map((url) => ({ url })),
          },
          badges: {
            create: course.badges.map((badge) => ({
              text: badge.text,
              color: badge.color,
              backgroundColor: badge.backgroundColor,
            })),
          },
          faq: course.faq
            ? {
                create: course.faq,
              }
            : undefined,
        },
        include: {
          organizationInfo: true, // Add this to verify creation
        },
      });

      // Add logging to verify course and organization creation
      console.log(`Created course: ${createdCourse.title}`);
      console.log("Organization Info:", createdCourse.organizationInfo);
    } catch (error) {
      console.error(`Failed to create course: ${course.title}`, error);
    }
  }

  console.log("Database seed completed");
}

main()
  .catch((e) => {
    console.error("Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
