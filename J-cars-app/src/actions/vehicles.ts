"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { VEHICLE_STATUSES } from "@/lib/catalog/constants";
import { getNextRefNo } from "@/lib/catalog/ref-no";
import { parseVehicleForm, type VehicleInput } from "@/lib/catalog/vehicle-schema";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type VehicleActionState = { error: string | null; success?: boolean };

// Only admin/inventory_manager may write vehicles (mirrors the
// vehicles_write_staff RLS policy, migration 0006). RLS is the real
// boundary; this is the second layer, per the note in src/lib/auth/roles.ts.
const STAFF_ROLES = ["admin", "inventory_manager"] as const;

function toRow(input: VehicleInput) {
  return {
    make_id: input.makeId,
    model_id: input.modelId,
    trim: input.trim ?? null,
    year: input.year,
    month: input.month ?? null,
    price_usd: input.priceUsd,
    sale_price_usd: input.salePriceUsd ?? null,
    mileage_km: input.mileageKm,
    engine_cc: input.engineCc ?? null,
    fuel_type: input.fuelType as Enums["fuel_type"],
    transmission: input.transmission as Enums["transmission_type"],
    drive_type: input.driveType as Enums["drive_type"],
    steering_side: input.steeringSide as Enums["steering_side"],
    body_type: input.bodyType as Enums["body_type"],
    color: input.color ?? null,
    seats: input.seats ?? null,
    doors: input.doors ?? null,
    chassis_no_private: input.chassisNoPrivate ?? null,
    vin_private: input.vinPrivate ?? null,
    width_mm: input.widthMm ?? null,
    height_mm: input.heightMm ?? null,
    length_mm: input.lengthMm ?? null,
    weight_kg: input.weightKg ?? null,
    location_id: input.locationId ?? null,
    description: input.description ?? null,
    status: input.status as Enums["vehicle_status"],
    published: input.published,
    featured: input.featured,
  };
}

export async function createVehicle(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  await requireRole(STAFF_ROLES);

  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const refNo = await getNextRefNo(supabase);
  const { data, error } = await supabase
    .from("vehicles")
    .insert({ ref_no: refNo, ...toRow(parsed.data) })
    .select("id")
    .single();
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/vehicles");
  redirect(`/admin/vehicles/${data.id}/edit`);
}

export async function updateVehicle(
  id: string,
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  await requireRole(STAFF_ROLES);

  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update(toRow(parsed.data)).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${id}/edit`);
  return { error: null, success: true };
}

export async function duplicateVehicle(id: string) {
  await requireRole(STAFF_ROLES);

  const supabase = await createClient();
  const { data: source, error: fetchError } = await supabase
    .from("vehicles")
    .select(
      "make_id, model_id, trim, year, month, price_usd, sale_price_usd, mileage_km, engine_cc, fuel_type, transmission, drive_type, steering_side, body_type, color, seats, doors, width_mm, height_mm, length_mm, weight_kg, location_id, description",
    )
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(`duplicateVehicle: ${fetchError.message}`);

  const refNo = await getNextRefNo(supabase);
  const { data: created, error: insertError } = await supabase
    .from("vehicles")
    .insert({ ...source, ref_no: refNo, status: "available", published: false, featured: false })
    .select("id")
    .single();
  if (insertError) throw new Error(`duplicateVehicle: ${insertError.message}`);

  revalidatePath("/admin/vehicles");
  redirect(`/admin/vehicles/${created.id}/edit`);
}

export async function setVehiclePublished(id: string, published: boolean) {
  await requireRole(STAFF_ROLES);

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update({ published }).eq("id", id);
  if (error) throw new Error(`setVehiclePublished: ${error.message}`);

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${id}/edit`);
}

export async function setVehicleStatus(id: string, status: (typeof VEHICLE_STATUSES)[number]) {
  await requireRole(STAFF_ROLES);

  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ status: status as Enums["vehicle_status"] })
    .eq("id", id);
  if (error) throw new Error(`setVehicleStatus: ${error.message}`);

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${id}/edit`);
}

export async function deleteVehicle(id: string) {
  await requireRole(STAFF_ROLES);

  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ deleted_at: new Date().toISOString(), published: false })
    .eq("id", id);
  if (error) throw new Error(`deleteVehicle: ${error.message}`);

  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles");
}
