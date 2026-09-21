"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

// Same staff roles as vehicles.ts — vehicle_images RLS (migration 0006) and
// the vehicle-images Storage bucket policy (migration 0008) both grant
// write to admin/inventory_manager, so this uses the authenticated
// session client, not the service-role admin client (kept confined to
// scripts/seed.ts).
const STAFF_ROLES = ["admin", "inventory_manager"] as const;
const BUCKET = "vehicle-images";

// Only these three, matching the file types the site actually serves.
// contentType is also whitelisted here so a request that lies about
// file.type can't get an arbitrary Content-Type served back from a
// public bucket (e.g. text/html, image/svg+xml with an inline script).
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
// Kept well under the serverActions.bodySizeLimit in next.config.ts
// (50mb, sized to this exact worst case) — the framework rejects an
// oversized request body before this function ever runs, so these two
// limits must stay in sync with that config, not just with each other.
const MAX_FILES_PER_UPLOAD = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadVehicleImages(vehicleId: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;
  if (files.length > MAX_FILES_PER_UPLOAD) {
    throw new Error(`uploadVehicleImages: at most ${MAX_FILES_PER_UPLOAD} files per upload.`);
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      throw new Error(`uploadVehicleImages: unsupported file type "${file.type}".`);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`uploadVehicleImages: "${file.name}" exceeds the 8MB limit.`);
    }
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("vehicle_images")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId);
  const startSortOrder = count ?? 0;
  const isFirstBatch = startSortOrder === 0;

  for (const [index, file] of files.entries()) {
    // Never interpolate file.name into the storage key — it's fully
    // attacker-controllable at the HTTP level and this bucket is public,
    // so a crafted filename (e.g. containing "/" or "..") could otherwise
    // place or overwrite objects outside this vehicle's own prefix.
    const extension = ALLOWED_IMAGE_TYPES[file.type];
    const storagePath = `${vehicleId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type });
    if (uploadError) throw new Error(`uploadVehicleImages: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("vehicle_images").insert({
      vehicle_id: vehicleId,
      storage_path: storagePath,
      public_url: publicUrl,
      sort_order: startSortOrder + index,
      is_primary: isFirstBatch && index === 0,
    });
    if (insertError) throw new Error(`uploadVehicleImages: ${insertError.message}`);
  }

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}

export async function deleteVehicleImage(imageId: string, vehicleId: string) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("vehicle_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();
  if (fetchError) throw new Error(`deleteVehicleImage: ${fetchError.message}`);

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([image.storage_path]);
  if (storageError) throw new Error(`deleteVehicleImage: ${storageError.message}`);

  const { error: deleteError } = await supabase.from("vehicle_images").delete().eq("id", imageId);
  if (deleteError) throw new Error(`deleteVehicleImage: ${deleteError.message}`);

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}

export async function setPrimaryVehicleImage(imageId: string, vehicleId: string) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();

  const { error: clearError } = await supabase
    .from("vehicle_images")
    .update({ is_primary: false })
    .eq("vehicle_id", vehicleId);
  if (clearError) throw new Error(`setPrimaryVehicleImage: ${clearError.message}`);

  const { error: setError } = await supabase
    .from("vehicle_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (setError) throw new Error(`setPrimaryVehicleImage: ${setError.message}`);

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}

export async function moveVehicleImage(vehicleId: string, imageId: string, direction: "up" | "down") {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from("vehicle_images")
    .select("id, sort_order")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`moveVehicleImage: ${error.message}`);

  const rows = images ?? [];
  const index = rows.findIndex((img) => img.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const swap = rows[swapIndex];

  await supabase.from("vehicle_images").update({ sort_order: swap.sort_order }).eq("id", current.id);
  await supabase.from("vehicle_images").update({ sort_order: current.sort_order }).eq("id", swap.id);

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}

export async function updateVehicleImageAlt(imageId: string, vehicleId: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const altText = String(formData.get("altText") ?? "").trim();
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicle_images")
    .update({ alt_text: altText || null })
    .eq("id", imageId);
  if (error) throw new Error(`updateVehicleImageAlt: ${error.message}`);

  revalidatePath(`/admin/vehicles/${vehicleId}/edit`);
}
