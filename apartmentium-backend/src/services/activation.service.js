import prisma from "../config/prisma.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";
import { activationEmailTemplate } from "../templates/activation-email.js";
import { sendEmail } from "./email.service.js";

const OTP_EXPIRATION_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 5;

export async function sendActivationOtp(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  if (user.status !== "PENDING_ACTIVATION") {
    throw new Error("This account does not require activation.");
  }

  const existingActivation = await prisma.accountActivation.findUnique({
    where: { userId },
  });

  if (existingActivation) {
    const secondsSinceLastSent =
      (Date.now() - existingActivation.lastSentAt.getTime()) / 1000;

    if (secondsSinceLastSent < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new Error("Please wait before requesting another OTP.");
    }
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // Send email before saving the new OTP record.
  await sendEmail({
    to: user.email,
    subject: "Apartmentium Account Activation",
    html: activationEmailTemplate(otp),
  });

  await prisma.accountActivation.upsert({
    where: { userId },
    create: {
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    update: {
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Activation OTP sent successfully.",
  };
}

export async function resendActivationOtpForEmail(email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) throw new Error("Email address is required.");

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "PENDING_ACTIVATION") {
    return {
      success: true,
      message: "If the account needs activation, a new OTP will be sent.",
    };
  }

  await sendActivationOtp(user.id);
  return { success: true, message: "A new activation OTP has been sent." };
}

export async function verifyActivationOtpForEmail(email, otp) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) throw new Error("Email address is required.");

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "PENDING_ACTIVATION") {
    throw new Error("The account or activation OTP is invalid.");
  }

  return verifyActivationOtp(user.id, otp);
}

export async function verifyActivationOtp(userId, submittedOtp) {
  if (typeof submittedOtp !== "string" || !/^\d{6}$/.test(submittedOtp)) {
    throw new Error("Please enter a valid 6-digit OTP.");
  }

  const activation = await prisma.accountActivation.findUnique({
    where: { userId },
  });

  if (!activation) {
    throw new Error("Activation OTP was not found.");
  }

  if (activation.expiresAt <= new Date()) {
    await prisma.accountActivation.delete({
      where: { userId },
    });

    throw new Error("Activation OTP has expired. Please request a new one.");
  }

  if (activation.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Maximum OTP attempts reached. Please request a new OTP.");
  }

  const isOtpValid = await verifyOtp(submittedOtp, activation.otpHash);

  if (!isOtpValid) {
    await prisma.accountActivation.update({
      where: { userId },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Incorrect OTP.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
      },
    }),

    prisma.accountActivation.delete({
      where: { userId },
    }),
  ]);

  return {
    success: true,
    message: "Account activated successfully.",
  };
}
