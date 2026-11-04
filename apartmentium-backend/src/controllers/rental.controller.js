import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { sendActivationOtp } from "../services/activation.service.js";
import { sendEmail } from "../services/email.service.js";

export async function assignTenant(req, res) {
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

    // Required fields
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

    // Validate password confirmation
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

    // Validate date format: YYYY-MM-DD
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

    // Hash password
    const passwordHashed = await bcrypt.hash(password, 10);

    // Create tenant and rental records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ensure the unit is still available
      const unitUpdate = await tx.unit.updateMany({
        where: {
          id: unitId,
          status: "AVAILABLE",
        },
        data: {
          status: "OCCUPIED",
        },
      });

      if (unitUpdate.count !== 1) {
        throw new Error("UNIT_NOT_AVAILABLE");
      }

      const user = await tx.user.create({
        data: {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          passwordHashed,
          role: "TENANT",
          status: "PENDING_ACTIVATION",
          profile: {
            create: {
              fullName: fullName.trim(),
              phone: phone?.trim() || null,
            },
          },
          tenant: {
            create: {},
          },
        },
        include: {
          tenant: true,
          profile: true,
        },
      });

      const rental = await tx.rental.create({
        data: {
          tenantId: user.tenant.id,
          unitId,
          monthlyRent: (
            await tx.unit.findUniqueOrThrow({
              where: { id: unitId },
              select: { unitPrice: true },
            })
          ).unitPrice,
          moveInDate: parsedDate,
          status: "ACTIVE",
        },
      });

      return {
        user,
        rental,
      };
    });

    // Send activation OTP after database transaction commits
    try {
      await sendActivationOtp(result.user.id);
    } catch (emailError) {
      console.error("Activation email failed:", emailError);

      try {
        await prisma.$transaction(async (tx) => {
          // Delete activation record, if one was created
          await tx.accountActivation.deleteMany({
            where: {
              userId: result.user.id,
            },
          });

          // Delete the rental created by this request
          await tx.rental.delete({
            where: {
              id: result.rental.id,
            },
          });

          // Delete tenant record
          await tx.tenant.delete({
            where: {
              id: result.user.tenant.id,
            },
          });

          // Delete profile
          await tx.userProfile.deleteMany({
            where: {
              userId: result.user.id,
            },
          });

          // Delete the user account
          await tx.user.delete({
            where: {
              id: result.user.id,
            },
          });

          // Make the unit available again
          await tx.unit.update({
            where: {
              id: result.rental.unitId,
            },
            data: {
              status: "AVAILABLE",
            },
          });
        });
      } catch (cleanupError) {
        console.error("Failed to cleanup tenant records:", cleanupError);

        return res.status(500).json({
          success: false,
          message:
            "Activation email failed and account cleanup also failed. Please check the database.",
        });
      }

      return res.status(502).json({
        success: false,
        message:
          "Activation email could not be sent. No tenant account was created. Please check the email address and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Tenant assigned successfully. Activation OTP sent.",
      tenant: {
        id: result.user.tenant.id,
        userId: result.user.id,
        fullName: result.user.profile.fullName,
        email: result.user.email,
        username: result.user.username,
        status: result.user.status,
      },
      rental: result.rental,
      activationEmailSent: true,
    });
  } catch (error) {
    if (error.message === "UNIT_NOT_AVAILABLE") {
      return res.status(409).json({
        success: false,
        message: "This unit is no longer available.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    console.error("Assign tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign tenant.",
    });
  }
}

export async function getRentalRecords(req, res) {
  try {
    const rentals = await prisma.rental.findMany({
      where: { status: { in: ["ACTIVE", "ON_LEAVING"] } },
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { include: { user: { include: { profile: true } } } },
        unit: true,
      },
    });

    const data = rentals.map((rental) => ({
      id: rental.id,
      unitId: rental.unit.id,
      tenant: {
        id: rental.tenant.id,
        fullName:
          rental.tenant.user.profile?.fullName ?? rental.tenant.user.username,
        username: rental.tenant.user.username,
        email: rental.tenant.user.email,
        phone: rental.tenant.user.profile?.phone ?? null,
        profileImageUrl: rental.tenant.user.profile?.profileImageUrl ?? null,
      },
      unit: {
        id: rental.unit.id,
        unitNumber: rental.unit.unitNumber,
        description: rental.unit.description,
        unitPrice: rental.unit.unitPrice.toString(),
        status: rental.unit.status,
      },
      monthlyRent: rental.monthlyRent.toString(),
      moveInDate: rental.moveInDate.toISOString().slice(0, 10),
      endDate: rental.endDate?.toISOString().slice(0, 10) ?? null,
      status: rental.status,
      createdAt: rental.createdAt,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get rental records error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve rental records." });
  }
}

export async function getMyRental(req, res) {
  try {
    const rental = await prisma.rental.findFirst({
      where: {
        tenant: { userId: req.user.id },
        status: { in: ["ACTIVE", "ON_LEAVING"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        unit: true,
        tenant: { include: { user: { include: { profile: true } } } },
      },
    });

    if (!rental) return res.status(200).json({ success: true, data: null });

    const profile = rental.tenant.user.profile;
    return res.status(200).json({
      success: true,
      data: {
        id: rental.id,
        status: rental.status,
        monthlyRent: rental.monthlyRent.toString(),
        moveInDate: rental.moveInDate.toISOString().slice(0, 10),
        endDate: rental.endDate?.toISOString().slice(0, 10) ?? null,
        tenant: {
          fullName: profile?.fullName ?? rental.tenant.user.username,
          email: rental.tenant.user.email,
          phone: profile?.phone ?? null,
        },
        unit: {
          id: rental.unit.id,
          unitNumber: rental.unit.unitNumber,
          description: rental.unit.description,
          unitPrice: rental.unit.unitPrice.toString(),
          status: rental.unit.status,
        },
      },
    });
  } catch (error) {
    console.error("Get tenant rental error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve your rental." });
  }
}

export async function changeTenantPassword(req, res) {
  try {
    const rental = await prisma.rental.findFirst({
      where: {
        id: req.params.rentalId,
        status: { in: ["ACTIVE", "ON_LEAVING"] },
      },
      select: {
        tenant: {
          select: {
            user: { select: { id: true, email: true, passwordHashed: true } },
          },
        },
      },
    });

    if (!rental?.tenant?.user) {
      return res.status(404).json({
        success: false,
        message: "Active tenant account was not found for this rental.",
      });
    }

    const user = rental.tenant.user;
    const temporaryPassword = randomBytes(18).toString("base64url");
    const passwordHashed = await bcrypt.hash(temporaryPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHashed },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Apartmentium password was changed",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#203b63">
            <h2>Your password has been changed</h2>
            <p>An administrator changed the password for your Apartmentium account.</p>
            <p>Your temporary password is:</p>
            <p style="padding:16px;background:#eef3f7;border-radius:8px;font-size:20px;font-weight:bold;letter-spacing:1px">${temporaryPassword}</p>
            <p>Sign in with this password, then change it from Security Settings.</p>
            <p>If you did not expect this change, contact the admin/landlord immediately.</p>
          </div>
        `,
      });
    } catch (emailError) {
      await prisma.user.updateMany({
        where: { id: user.id, passwordHashed },
        data: { passwordHashed: user.passwordHashed },
      });
      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: `A new password was sent to ${user.email}.`,
    });
  } catch (error) {
    console.error("Change tenant password error:", error);
    return res.status(502).json({
      success: false,
      message:
        "Could not email the new password. The account password was not changed.",
    });
  }
}
