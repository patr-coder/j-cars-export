"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

// Same roles as vehicles_write_staff (migration 0006).
const STAFF_ROLES = ["admin", "inventory_manager"] as const;

function back(error?: string): never {
  redirect(error ? `/admin/promotions?error=${encodeURIComponent(error)}` : "/admin/promotions");
}

function revalidatePublic() {
  revalidatePath("/admin/promotions");
  revalidatePath("/");
  revalidatePath("/stock");
}

export async function setVehicleFeatured(id: string, featured: boolean) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update({ featured }).eq("id", id);
  if (error) back(`Could not update: ${error.message}`);
  revalidatePublic();
  back();
}

const salePriceSchema = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.coerce.number().positive().max(10_000_000).nullable(),
);

export async function setVehicleSalePrice(id: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const parsed = salePriceSchema.safeParse(formData.get("salePriceUsd"));
  if (!parsed.success) back("Sale price must be a positive number, or empty to remove it.");

  const supabase = await createClient();
  const { data: vehicle, error: readError } = await supabase
    .from("vehicles")
    .select("price_usd")
    .eq("id", id)
    .maybeSingle();
  if (readError || !vehicle) back("Vehicle not found.");
  if (parsed.data !== null && parsed.data >= Number(vehicle.price_usd)) {
    back("The sale price must be lower than the regular price.");
  }

  const { error } = await supabase.from("vehicles").update({ sale_price_usd: parsed.data }).eq("id", id);
  if (error) back(`Could not update: ${error.message}`);
  revalidatePublic();
  back();
}
