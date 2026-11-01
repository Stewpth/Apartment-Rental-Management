import prisma from "../config/prisma.js";

async function testDatabaseConnection() {
  try {
    await prisma.$connect();

    console.log("Successfully connected to Neon PostgreSQL!");

    const result = await prisma.$queryRaw`SELECT NOW()`;

    console.log("Database time:", result[0].now);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
