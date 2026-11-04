import { randomUUID } from "node:crypto";
import supabase, { requestAttachmentsBucket } from "../config/supabase.js";

const PROFILE_IMAGE_PREFIX = "profile-avatars";
const PROFILE_IMAGE_URL_TTL = 60 * 60 * 24 * 7;

export function parseProfileImage(value) {
  if (typeof value !== "string") return null;
  const match = value.match(
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/,
  );
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (
    !buffer.length ||
    buffer.length > 5 * 1024 * 1024 ||
    buffer.toString("base64") !== match[2]
  ) {
    return null;
  }
  const mimeType = `image/${match[1]}`;
  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  return { buffer, mimeType, extension };
}

export function isProfileStorageKey(value, userId) {
  return (
    typeof value === "string" &&
    value.startsWith(`${PROFILE_IMAGE_PREFIX}/${userId}/`) &&
    /^profile-avatars\/[^/]+\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value)
  );
}

export async function presentUser(user) {
  if (!user) return user;
  const result = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    ...(user.profile ? { profile: { ...user.profile } } : { profile: null }),
  };
  const imageKey = result.profile?.profileImageUrl;
  if (isProfileStorageKey(imageKey, user.id)) {
    try {
      const { data, error } = await supabase.storage
        .from(requestAttachmentsBucket)
        .createSignedUrl(imageKey, PROFILE_IMAGE_URL_TTL);
      result.profile.profileImageUrl = error ? null : data.signedUrl;
    } catch (error) {
      console.error("Unable to create profile image link:", error);
      result.profile.profileImageUrl = null;
    }
  }
  return result;
}

export async function uploadProfileImage(userId, image) {
  const storageKey = `${PROFILE_IMAGE_PREFIX}/${userId}/${randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage
    .from(requestAttachmentsBucket)
    .upload(storageKey, image.buffer, {
      contentType: image.mimeType,
      upsert: false,
    });
  if (error) throw error;
  return storageKey;
}

export async function removeProfileImage(storageKey) {
  if (!storageKey) return;
  try {
    const { error } = await supabase.storage
      .from(requestAttachmentsBucket)
      .remove([storageKey]);
    if (error) console.error("Unable to remove replaced profile image:", error);
  } catch (error) {
    console.error("Unable to remove replaced profile image:", error);
  }
}
