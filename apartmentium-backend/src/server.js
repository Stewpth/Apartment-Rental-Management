import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!");

    const server = app.listen(PORT, () => {
      console.log(`Apartmentium API running at http://localhost:${PORT}`);
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
