"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

// countries/ports/shipping_rates RLS (migration 0006) grants write to
// 'admin' only — same stricter-than-vehicles pattern as catalog.ts.
const ADMIN_ONLY = ["admin"] as const;

function backToShipping(error?: string): never {
  redirect(error ? `/admin/shipping?error=${encodeURIComponent(error)}` : "/admin/shipping");
}

function isForeignKeyViolation(error: { code?: string }): boolean {
  return error.code === "23503";
}

function numberOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function createCountry(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const name = String(formData.get("name") ?? "").trim();
  const isoCode = String(formData.get("isoCode") ?? "").trim().toUpperCase();
  const currency = String(formData.get("currency") ?? "").trim().toUpperCase();
  if (!name || !isoCode || !currency) backToShipping("Name, ISO code, and currency are required.");

  const supabase = await createClient();
  const { error } = await supabase.from("countries").insert({ name, iso_code: isoCode, currency });
  if (error) backToShipping(`Could not create country: ${error.message}`);

  revalidatePath("/admin/shipping");
  backToShipping();
}

export async function deleteCountry(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("countries").delete().eq("id", id);
  if (error) {
    backToShipping(
      isForeignKeyViolation(error) ? "Can't delete a country that still has ports." : error.message,
    );
  }

  revalidatePath("/admin/shipping");
  backToShipping();
}

export async function createPort(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const countryId = String(formData.get("countryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!countryId || !name || !code) backToShipping("Country, name, and code are required.");

  const supabase = await createClient();
  const { error } = await supabase.from("ports").insert({ country_id: countryId, name, code });
  if (error) backToShipping(`Could not create port: ${error.message}`);

  revalidatePath("/admin/shipping");
  backToShipping();
}

export async function deletePort(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("ports").delete().eq("id", id);
  if (error) {
    backToShipping(
      isForeignKeyViolation(error) ? "Can't delete a port still used by shipping rates." : error.message,
    );
  }

  revalidatePath("/admin/shipping");
  backToShipping();
}

export async function createShippingRate(formData: FormData) {
  await requireRole(ADMIN_ONLY);
  const originLocationId = String(formData.get("originLocationId") ?? "");
  const destinationPortId = String(formData.get("destinationPortId") ?? "");
  const method = String(formData.get("method") ?? "");
  const baseCostUsd = numberOrNull(formData, "baseCostUsd");
  if (!originLocationId || !destinationPortId || !method || baseCostUsd === null) {
    backToShipping("Origin, destination port, method, and base cost are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shipping_rates").insert({
    origin_location_id: originLocationId,
    destination_port_id: destinationPortId,
    method: method as Enums["shipping_method"],
    base_cost_usd: baseCostUsd!,
    m3_rate: numberOrNull(formData, "m3Rate"),
    insurance_rate: numberOrNull(formData, "insuranceRate"),
    inspection_fee_usd: numberOrNull(formData, "inspectionFeeUsd"),
    certificate_fee_usd: numberOrNull(formData, "certificateFeeUsd"),
    local_export_fee_usd: numberOrNull(formData, "localExportFeeUsd"),
  });
  if (error) backToShipping(`Could not create shipping rate: ${error.message}`);

  revalidatePath("/admin/shipping");
  backToShipping();
}

export async function setShippingRateActive(id: string, active: boolean) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("shipping_rates").update({ active }).eq("id", id);
  if (error) throw new Error(`setShippingRateActive: ${error.message}`);

  revalidatePath("/admin/shipping");
}

export async function deleteShippingRate(id: string) {
  await requireRole(ADMIN_ONLY);
  const supabase = await createClient();
  const { error } = await supabase.from("shipping_rates").delete().eq("id", id);
  if (error) backToShipping(error.message);

  revalidatePath("/admin/shipping");
  backToShipping();
}
