import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function createAdmin() {
  try {
    // Get Admin credentials from .env.
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // Validate Admin credentials.
    if (!username || !email || !password) {
      throw new Error("Missing Admin credentials in .env");
    }

    // Check if an Admin account already exists.
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log("An Admin account already exists.");
      return;
    }

    // Check if username or email is already taken.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      console.log("Username or email is already in use.");
      return;
    }

    // Hash the password.
    const passwordHashed = await bcrypt.hash(password, 10);

    // Create Admin account.
    await prisma.user.create({
      data: {
        username,
        email,
        passwordHashed,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Initial Admin account created successfully!");
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
  } catch (error) {
    console.error("Failed to create Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
