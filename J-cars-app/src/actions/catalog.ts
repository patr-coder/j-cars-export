"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { slugify } from "@/lib/catalog/slug";
import { createClient } from "@/lib/supabase/server";

// makes/models/locations RLS (migration 0006) grants write to 'admin'
// only, not inventory_manager — stricter than vehicles/vehicle_images.
const ADMIN_ONLY = ["admin"] as const;

function backToCatalog(error?: string): never {
  redirect(error ? `/admin/catalog?error=${encodeURIComponent(error)}` : "/admin/catalog");
}

// Postgres foreign_key_violation — e.g. deleting a make still referenced
// by a vehicle. Surfaced as a friendly message instead of a 500.
function isForeignKeyViolation(error: { code?: string }): boolean {
  return error.code === "23503";
}

export async function createMake(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) backToCatalog("Make name is required.");

  const supabase = await createClient();
  const { error } = await supabase.from("makes").insert({ name, slug: slugify(name) });
  if (error) backToCatalog(`Could not create make: ${error.message}`);

  revalidatePath("/admin/catalog");
  backToCatalog();
}

export async function deleteMake(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("makes").delete().eq("id", id);
  if (error) {
    backToCatalog(
      isForeignKeyViolation(error)
        ? "Can't delete a make that still has models or vehicles."
        : error.message,
    );
  }

  revalidatePath("/admin/catalog");
  backToCatalog();
}

export async function createModel(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const makeId = String(formData.get("makeId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!makeId || !name) backToCatalog("Make and model name are required.");

  const supabase = await createClient();
  const { error } = await supabase.from("models").insert({ make_id: makeId, name, slug: slugify(name) });
  if (error) backToCatalog(`Could not create model: ${error.message}`);

  revalidatePath("/admin/catalog");
  backToCatalog();
}

export async function deleteModel(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("models").delete().eq("id", id);
  if (error) {
    backToCatalog(
      isForeignKeyViolation(error) ? "Can't delete a model that still has vehicles." : error.message,
    );
  }

  revalidatePath("/admin/catalog");
  backToCatalog();
}

export async function createLocation(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const yardName = String(formData.get("yardName") ?? "").trim();
  if (!country || !city || !yardName) backToCatalog("Country, city, and yard name are required.");

  const supabase = await createClient();
  const { error } = await supabase.from("locations").insert({ country, city, yard_name: yardName });
  if (error) backToCatalog(`Could not create location: ${error.message}`);

  revalidatePath("/admin/catalog");
  backToCatalog();
}

export async function deleteLocation(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) {
    backToCatalog(
      isForeignKeyViolation(error) ? "Can't delete a location still used by vehicles." : error.message,
    );
  }

  revalidatePath("/admin/catalog");
  backToCatalog();
}
