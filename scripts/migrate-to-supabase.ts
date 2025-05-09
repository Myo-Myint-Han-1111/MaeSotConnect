import { PrismaClient, Prisma } from "@prisma/client";
import * as dotenv from "dotenv";

// Load both environment variables
dotenv.config({ path: ".env.local" }); // Source database
dotenv.config(); // Target (Supabase) database

// Create two Prisma clients - one for source, one for target
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DATABASE_URL, // Your original database
    },
  },
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Your Supabase database
    },
  },
});

async function migrateToSupabase() {
  try {
    console.log("Starting migration to Supabase...");

    // Verify connection to source database
    const sourceTest = await sourcePrisma.$queryRaw`SELECT NOW()`;
    console.log("Source database connection successful:", sourceTest);

    // Verify connection to target database (Supabase)
    const targetTest = await targetPrisma.$queryRaw`SELECT NOW()`;
    console.log(
      "Target database (Supabase) connection successful:",
      targetTest
    );

    // Get organizations from source
    const organizations = await sourcePrisma.organization.findMany();
    console.log(
      `Found ${organizations.length} organizations in source database`
    );

    // Migrate organizations to target
    console.log("Migrating organizations...");
    for (const org of organizations) {
      // Remove any Supabase-specific fields that might cause conflicts
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { created_at, updated_at, ...orgData } = org as Record<
        string,
        unknown
      >; // Using 'any' is necessary for Prisma compatibility

      await targetPrisma.organization.upsert({
        where: { id: org.id },
        update: orgData as Prisma.OrganizationUncheckedUpdateInput,
        create: orgData as Prisma.OrganizationUncheckedCreateInput,
      });
    }
    console.log("Organizations migrated successfully!");

    // Get users from source
    const users = await sourcePrisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
    });
    console.log(`Found ${users.length} users in source database`);

    // Migrate users to target
    console.log("Migrating users...");
    for (const user of users) {
      const { accounts, sessions, ...userData } = user;

      // Create user in target
      await targetPrisma.user.upsert({
        where: { id: user.id },
        update: userData,
        create: userData,
      });

      // Migrate accounts
      if (accounts && accounts.length > 0) {
        for (const account of accounts) {
          await targetPrisma.account.upsert({
            where: { id: account.id },
            update: account,
            create: account,
          });
        }
      }

      // Migrate sessions
      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          await targetPrisma.session.upsert({
            where: { id: session.id },
            update: session,
            create: session,
          });
        }
      }
    }
    console.log("Users migrated successfully!");

    // Get courses with all relationships from source
    const courses = await sourcePrisma.course.findMany({
      include: {
        images: true,
        badges: true,
        faq: true,
      },
    });
    console.log(`Found ${courses.length} courses in source database`);

    // Migrate courses to target
    console.log("Migrating courses and related data...");
    for (const course of courses) {
      const { images, badges, faq, ...courseData } = course;

      // Create course in target
      await targetPrisma.course.upsert({
        where: { id: course.id },
        update: courseData,
        create: courseData,
      });

      // Migrate images
      if (images && images.length > 0) {
        for (const image of images) {
          await targetPrisma.image.upsert({
            where: { id: image.id },
            update: { ...image, courseId: course.id },
            create: { ...image, courseId: course.id },
          });
        }
      }

      // Migrate badges
      if (badges && badges.length > 0) {
        for (const badge of badges) {
          await targetPrisma.badge.upsert({
            where: { id: badge.id },
            update: { ...badge, courseId: course.id },
            create: { ...badge, courseId: course.id },
          });
        }
      }

      // Migrate FAQs
      if (faq && faq.length > 0) {
        for (const faqItem of faq) {
          await targetPrisma.fAQ.upsert({
            where: { id: faqItem.id },
            update: { ...faqItem, courseId: course.id },
            create: { ...faqItem, courseId: course.id },
          });
        }
      }
    }
    console.log("Courses and related data migrated successfully!");

    // Get verification tokens from source
    const verificationTokens = await sourcePrisma.verificationToken.findMany();
    console.log(
      `Found ${verificationTokens.length} verification tokens in source database`
    );

    // Migrate verification tokens to target
    if (verificationTokens.length > 0) {
      console.log("Migrating verification tokens...");
      for (const token of verificationTokens) {
        await targetPrisma.verificationToken.upsert({
          where: {
            identifier_token: {
              identifier: token.identifier,
              token: token.token,
            },
          },
          update: token,
          create: token,
        });
      }
      console.log("Verification tokens migrated successfully!");
    }

    console.log("Migration to Supabase completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

migrateToSupabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
