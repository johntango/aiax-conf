import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // no-op
}
main().finally(() => prisma.$disconnect());
