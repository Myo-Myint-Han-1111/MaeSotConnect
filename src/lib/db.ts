import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? [] : ["warn", "error"],
  datasourceUrl: process.env.NODE_ENV === "development" 
    ? process.env.DATABASE_URL // Use pooled connection for development
    : process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
