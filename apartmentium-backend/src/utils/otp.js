import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";

const OTP_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

export async function verifyOtp(otp, otpHash) {
  return bcrypt.compare(otp, otpHash);
}
