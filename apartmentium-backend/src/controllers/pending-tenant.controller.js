import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { verifyOtp } from "../utils/otp.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendEmail } from "../services/email.service.js";
import { activationEmailTemplate } from "../templates/activation-email.js";

export async function requestTenantActivation(req, res) {
  try {
    const {
      fullName,
      email,
      username,
      phone,
      password,
      confirmPassword,
      unitId,
      moveInDate,
    } = req.body;

    // Validate required fields
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !username?.trim() ||
      !password ||
      !confirmPassword ||
      !unitId ||
      !moveInDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email syntax validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Validate move-in date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(moveInDate)) {
      return res.status(400).json({
        success: false,
        message: "Move-in date must use YYYY-MM-DD format.",
      });
    }

    const parsedDate = new Date(`${moveInDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== moveInDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid move-in date.",
      });
    }

    // Check if email or username is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: username.trim() }],
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered.",
      });
    }

    // Check unit availability
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        status: "AVAILABLE",
      },
      select: {
        id: true,
      },
    });

    if (!unit) {
      return res.status(409).json({
        success: false,
        message: "This unit is no longer available.",
      });
    }

    // Hash password and generate OTP
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    // Create temporary registration
    const pendingRegistration = await prisma.pendingTenantRegistration.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        username: username.trim(),
        passwordHash,
        phone: phone?.trim() || null,
        unitId,
        moveInDate: parsedDate,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
    });

    // Send OTP email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Apartmentium Account Activation",
        html: activationEmailTemplate(otp),
      });
    } catch (emailError) {
      console.error("Pending tenant OTP email failed:", emailError);

      // Delete temporary registration if email sending fails
      await prisma.pendingTenantRegistration.delete({
        where: {
          id: pendingRegistration.id,
        },
      });

      return res.status(502).json({
        success: false,
        message:
          "Activation email could not be sent. Please check the email address and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Activation OTP sent. Please verify your email.",
      registrationId: pendingRegistration.id,
      email: pendingRegistration.email,
      expiresIn: 300,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Email or username is already registered or pending verification.",
      });
    }

    console.error("Request tenant activation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start tenant registration.",
    });
  }
}

export async function verifyTenantActivation(req, res) {
  try {
    const { registrationId, otp } = req.body;

    if (!registrationId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Registration ID and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.pendingTenantRegistration.findUnique({
        where: { id: registrationId },
      });

      if (!registration) {
        return {
          status: "NOT_FOUND",
        };
      }

      // Check expiration
      /*
      if (new Date() > registration.expiresAt) {
        await tx.pendingTenantRegistration.delete({
          where: { id: registration.id },
        });

        return {
          status: "EXPIRED",
        };
      }
    */

      if (new Date() > registration.expiresAt) {
        return {
          status: "EXPIRED",
        };
      }

      // Check maximum attempts
      if (registration.attempts >= 5) {
        return {
          status: "MAX_ATTEMPTS",
        };
      }

      // Verify OTP against its hashed value
      const isOtpValid = await verifyOtp(otp, registration.otpHash);

      if (!isOtpValid) {
        const updatedRegistration = await tx.pendingTenantRegistration.update({
          where: { id: registration.id },
          data: {
            attempts: {
              increment: 1,
            },
          },
        });

        return {
          status:
            updatedRegistration.attempts >= 5 ? "MAX_ATTEMPTS" : "INVALID_OTP",
        };
      }

      // Check if email or username was used by another account
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { email: registration.email },
            { username: registration.username },
          ],
        },
      });

      if (existingUser) {
        await tx.pendingTenantRegistration.delete({
          where: { id: registration.id },
        });

        return {
          status: "ACCOUNT_EXISTS",
        };
      }

      // Ensure the selected unit is still available
      const unit = await tx.unit.findUnique({
        where: { id: registration.unitId },
      });

      if (!unit || unit.status !== "AVAILABLE") {
        await tx.pendingTenantRegistration.delete({
          where: { id: registration.id },
        });

        return {
          status: "UNIT_UNAVAILABLE",
        };
      }

      // Create permanent tenant account
      const user = await tx.user.create({
        data: {
          username: registration.username,
          email: registration.email,
          passwordHashed: registration.passwordHash,
          role: "TENANT",
          status: "ACTIVE",
        },
      });

      // Create tenant profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          fullName: registration.fullName,
          phone: registration.phone,
        },
      });

      // Create tenant record
      const tenant = await tx.tenant.create({
        data: {
          userId: user.id,
        },
      });

      // Assign the tenant to the selected unit
      const rental = await tx.rental.create({
        data: {
          tenantId: tenant.id,
          unitId: unit.id,
          monthlyRent: unit.unitPrice,
          moveInDate: registration.moveInDate,
          status: "ACTIVE",
        },
      });

      // Mark the unit as occupied
      await tx.unit.update({
        where: { id: unit.id },
        data: {
          status: "OCCUPIED",
        },
      });

      // Remove the temporary registration
      await tx.pendingTenantRegistration.delete({
        where: { id: registration.id },
      });

      return {
        status: "SUCCESS",
        userId: user.id,
        tenantId: tenant.id,
        rentalId: rental.id,
      };
    });

    // Handle transaction results
    switch (result.status) {
      case "NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Pending registration was not found.",
        });

      case "EXPIRED":
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        });

      case "MAX_ATTEMPTS":
        return res.status(429).json({
          success: false,
          message: "Maximum OTP attempts reached. Please request a new OTP.",
        });

      case "INVALID_OTP":
        return res.status(400).json({
          success: false,
          message: "Incorrect OTP.",
        });

      case "ACCOUNT_EXISTS":
        return res.status(409).json({
          success: false,
          message: "Email or username is already registered.",
        });

      case "UNIT_UNAVAILABLE":
        return res.status(409).json({
          success: false,
          message: "The selected unit is no longer available.",
        });

      case "SUCCESS":
        return res.status(201).json({
          success: true,
          message: "Tenant account activated and unit assigned successfully.",
          data: {
            userId: result.userId,
            tenantId: result.tenantId,
            rentalId: result.rentalId,
          },
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Unexpected verification result.",
        });
    }
  } catch (error) {
    console.error("Verify tenant activation error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify tenant activation.",
    });
  }
}

export async function resendTenantActivationOtp(req, res) {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required.",
      });
    }

    const registration = await prisma.pendingTenantRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Pending registration was not found.",
      });
    }

    // 30-second resend cooldown
    const cooldownMs = 30 * 1000;
    const timeSinceLastSent = Date.now() - registration.lastSentAt.getTime();

    if (timeSinceLastSent < cooldownMs) {
      const remainingSeconds = Math.ceil(
        (cooldownMs - timeSinceLastSent) / 1000,
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
        retryAfter: remainingSeconds,
      });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    // Send the new OTP
    await sendEmail({
      to: registration.email,
      subject: "Apartmentium Account Activation",
      html: activationEmailTemplate(otp),
    });

    // Update OTP only after the email provider accepts the message
    await prisma.pendingTenantRegistration.update({
      where: { id: registration.id },
      data: {
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "A new activation OTP has been sent.",
      registrationId: registration.id,
      email: registration.email,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Resend tenant activation OTP error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to resend activation OTP.",
    });
  }
}
