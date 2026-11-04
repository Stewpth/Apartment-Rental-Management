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

export async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: { select: { fullName: true, phone: true, profileImageUrl: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User account is invalid." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve user session." });
  }
}

function validProfileImage(value) {
  if (value === null || value === "") return true;
  if (typeof value !== "string") return false;
  if (/^https:\/\//i.test(value)) return value.length <= 2048;
  const match = value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return false;
  const bytes = Buffer.from(match[2], "base64");
  return bytes.length > 0 && bytes.length <= 5 * 1024 * 1024 && bytes.toString("base64") === match[2];
}

export async function updateMyProfile(req, res) {
  const body = req.body ?? {};
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const profileImageUrl = body.profileImageUrl ?? null;
  if (!fullName || fullName.length > 120 || !username || username.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || phone.length > 30 || !validProfileImage(profileImageUrl)) {
    return res.status(400).json({ success: false, message: "Enter valid profile information and use an image up to 5 MB." });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: req.user.id }, data: { username, email } });
      await tx.userProfile.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id, fullName, phone: phone || null, profileImageUrl },
        update: { fullName, phone: phone || null, profileImageUrl },
      });
      return tx.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true, username: true, email: true, role: true,
          profile: { select: { fullName: true, phone: true, profileImageUrl: true } },
        },
      });
    });
    return res.json({ success: true, message: "Profile updated successfully.", user });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "That username or email is already in use." });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || !currentPassword || typeof newPassword !== "string" || newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
    return res.status(400).json({ success: false, message: "Enter your current password and a new password between 8 and 72 bytes." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHashed: true } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHashed))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    const passwordHashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHashed } });
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to update password." });
  }
}
