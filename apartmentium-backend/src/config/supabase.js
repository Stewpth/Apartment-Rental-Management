import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required.",
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

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
