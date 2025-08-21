import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances in development
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // Optional logs
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}