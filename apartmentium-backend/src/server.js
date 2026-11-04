import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import {
  checkRequestAttachmentStorage,
  requestAttachmentsBucket,
} from "./config/supabase.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required to start the API.");
    }
    if (
      process.env.NODE_ENV === "production" &&
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error("JWT_SECRET must be at least 32 characters in production.");
    }

    await prisma.$connect();
    console.log("Database connected successfully!");

    try {
      const bucket = await checkRequestAttachmentStorage();
      console.log(
        `Supabase Storage connected; bucket "${bucket.name}" is available.`,
      );
    } catch (error) {
      console.error(
        `Supabase Storage check failed for bucket "${requestAttachmentsBucket}": ${error.message}`,
      );
      console.error(
        "Request image uploads are unavailable until Supabase Storage access and the bucket are configured.",
      );
    }

    const server = app.listen(PORT, () => {
      console.log(`Apartmentium API listening on port ${PORT}`);
    });

    process.on("SIGINT", () => shutdown(server));
    process.on("SIGTERM", () => shutdown(server));
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function shutdown(server) {
  console.log("\nShutting down Apartmentium API...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected successfully!");
    process.exit(0);
  });
}

startServer();
