import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import {
  isProfileStorageKey,
  parseProfileImage,
  presentUser,
  removeProfileImage,
  uploadProfileImage,
} from "../services/profile-image.service.js";

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
      include: {
        profile: {
          select: { fullName: true, phone: true, profileImageUrl: true },
        },
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
      user: await presentUser(user),
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
        profile: {
          select: { fullName: true, phone: true, profileImageUrl: true },
        },
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User account is invalid." });
    }

    return res
      .status(200)
      .json({ success: true, user: await presentUser(user) });
  } catch (error) {
    console.error("Get current user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve user session." });
  }
}

export async function updateMyProfile(req, res) {
  const body = req.body ?? {};
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const submittedImage = Object.hasOwn(body, "profileImage");
  const newImage = submittedImage ? parseProfileImage(body.profileImage) : null;
  if (
    !fullName ||
    fullName.length > 120 ||
    !username ||
    username.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    phone.length > 30 ||
    (submittedImage && !newImage)
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Enter valid profile information and use an image up to 5 MB.",
      });
  }

  let uploadedStorageKey = null;
  let previousStorageKey = null;
  let uploadAttempted = false;
  try {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id },
      select: { profileImageUrl: true },
    });
    const existingImage = existingProfile?.profileImageUrl ?? null;
    previousStorageKey = isProfileStorageKey(existingImage, req.user.id)
      ? existingImage
      : null;
    const imageToUpload =
      newImage ||
      (existingImage?.startsWith("data:image/")
        ? parseProfileImage(existingImage)
        : null);
    if (imageToUpload) {
      uploadAttempted = true;
      uploadedStorageKey = await uploadProfileImage(req.user.id, imageToUpload);
    } else if (existingImage?.startsWith("data:image/")) {
      throw new Error(
        "Stored profile image is invalid and could not be migrated.",
      );
    }
    const profileImageUrl = uploadedStorageKey || existingImage;
    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user.id },
        data: { username, email },
      });
      await tx.userProfile.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          fullName,
          phone: phone || null,
          profileImageUrl,
        },
        update: { fullName, phone: phone || null, profileImageUrl },
      });
      return tx.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          profile: {
            select: { fullName: true, phone: true, profileImageUrl: true },
          },
        },
      });
    });
    if (
      uploadedStorageKey &&
      previousStorageKey &&
      previousStorageKey !== uploadedStorageKey
    ) {
      await removeProfileImage(previousStorageKey);
    }
    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: await presentUser(user),
    });
  } catch (error) {
    if (uploadedStorageKey) await removeProfileImage(uploadedStorageKey);
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          success: false,
          message: "That username or email is already in use.",
        });
    }
    if (uploadAttempted && !uploadedStorageKey) {
      console.error("Update profile error:", error);
      return res
        .status(502)
        .json({
          success: false,
          message:
            "Unable to upload your profile photo to Supabase. Please try again.",
        });
    }
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update profile." });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};
  if (
    typeof currentPassword !== "string" ||
    !currentPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    Buffer.byteLength(newPassword, "utf8") > 72
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Enter your current password and a new password between 8 and 72 bytes.",
      });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHashed: true },
    });
    if (
      !user ||
      !(await bcrypt.compare(currentPassword, user.passwordHashed))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }
    const passwordHashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHashed },
    });
    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update password." });
  }
}
