import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const requestAttachmentsBucket =
  process.env.SUPABASE_REQUEST_ATTACHMENTS_BUCKET || "request-attachments";

export async function checkRequestAttachmentStorage() {
  const { data, error } = await supabase.storage.getBucket(
    requestAttachmentsBucket,
  );
  if (error) throw error;
  return data;
}

export default supabase;
