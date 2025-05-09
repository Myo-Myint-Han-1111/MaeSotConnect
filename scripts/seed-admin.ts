import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = "admin@maesotconnect.org";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Platform admin already exists. Skipping creation.");
      return;
    }

    // Create platform admin
    const hashedPassword = await hashPassword("AdminPassword123!");

    const admin = await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        password: hashedPassword,
        role: Role.PLATFORM_ADMIN,
      },
    });

    console.log("Platform admin created successfully:", admin.id);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
