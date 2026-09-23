import "server-only";

import type { SupabaseClient as BaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type SupabaseClient = BaseClient<Database>;

export const ORDER_FILES_BUCKET = "order-files";
const SIGNED_URL_TTL_SECONDS = 10 * 60;

// Content type is whitelisted and stored explicitly so a request lying
// about file.type can't get an arbitrary Content-Type (e.g. text/html)
// served back through a signed URL.
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
// Stays under serverActions.bodySizeLimit in next.config.ts.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateOrderFile(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return "Choose a file to upload.";
  if (!ALLOWED_TYPES[file.type]) return "Only PDF, JPG, PNG or WebP files are accepted.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "Files must be 5MB or smaller.";
  return null;
}

// Never derived from file.name — keys are {orderId}/{folder}/<uuid>.<ext>,
// the exact shape the order-files storage policies (migration 0012) expect.
export function orderFilePath(orderId: string, folder: "payments" | "documents", file: File): string {
  return `${orderId}/${folder}/${crypto.randomUUID()}.${ALLOWED_TYPES[file.type]}`;
}

export async function uploadOrderFile(supabase: SupabaseClient, path: string, file: File) {
  return supabase.storage.from(ORDER_FILES_BUCKET).upload(path, file, { contentType: file.type });
}

// Uses the caller's session client, so Storage only signs objects the
// order-files select policy already lets this user read.
export async function signOrderFileUrls(
  supabase: SupabaseClient,
  paths: string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;
  const { data, error } = await supabase.storage
    .from(ORDER_FILES_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw new Error(`signOrderFileUrls: ${error.message}`);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return urls;
}
