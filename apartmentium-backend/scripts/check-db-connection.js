import prisma from "../src/config/prisma.js";

try {
  await prisma.$connect();
  const result = await prisma.$queryRaw`SELECT NOW()`;
  console.log("Database connection succeeded:", result[0].now);
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
