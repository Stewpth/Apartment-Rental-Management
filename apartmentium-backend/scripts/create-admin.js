import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function createAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !email || !password) {
      throw new Error(
        "Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the backend .env file.",
      );
    }

    if (
      username.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      throw new Error(
        "Use a valid email, a username up to 120 characters, and a password between 8 and 72 bytes.",
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new Error("That username or email is already in use.");
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        username,
        email,
        passwordHashed,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Admin account created successfully.");
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
  } catch (error) {
    console.error("Failed to create Admin:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
