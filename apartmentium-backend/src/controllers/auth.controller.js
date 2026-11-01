import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const normalizedIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedIdentifier },
          { email: normalizedIdentifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    if (!["ADMIN", "TENANT"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid account role.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHashed);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
