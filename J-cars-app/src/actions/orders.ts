"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/roles";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/resend";
import { reservationConfirmedEmail } from "@/lib/email/templates";
import { ORDER_STATUSES, RESERVATION_HOLD_HOURS } from "@/lib/orders/constants";
import { getNextOrderNo } from "@/lib/orders/order-no";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type ReserveActionState = { error: string | null; success?: boolean };

const STAFF_ROLES = ["admin", "sales"] as const;

export async function reserveVehicle(
  vehicleId: string,
  _prevState: ReserveActionState,
): Promise<ReserveActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to reserve a vehicle." };

  const supabase = await createClient();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("status, price_usd, sale_price_usd, year, make:makes(name), model:models(name)")
    .eq("id", vehicleId)
    .maybeSingle();
  if (vehicleError) return { error: vehicleError.message };
  if (!vehicle) return { error: "Vehicle not found." };
  if (vehicle.status !== "available") {
    return { error: "This vehicle is no longer available to reserve." };
  }

  const v = vehicle as unknown as {
    status: string;
    price_usd: number;
    sale_price_usd: number | null;
    year: number;
    make: { name: string };
    model: { name: string };
  };
  const totalUsd = v.sale_price_usd ?? v.price_usd;
  const vehicleLabel = `${v.year} ${v.make.name} ${v.model.name}`;
  const reservedUntil = new Date(Date.now() + RESERVATION_HOLD_HOURS * 60 * 60 * 1000).toISOString();
  const orderNo = await getNextOrderNo(supabase);

  const { error: insertError } = await supabase.from("orders").insert({
    order_no: orderNo,
    user_id: user.id,
    vehicle_id: vehicleId,
    status: "reserved" as Enums["order_status"],
    total_usd: totalUsd,
    reserved_until: reservedUntil,
  });
  if (insertError) {
    // orders_one_active_per_vehicle (migration 0011) — two people reserving
    // the same vehicle at once; the loser hits this instead of overbooking it.
    if (insertError.code === "23505") {
      return { error: "This vehicle was just reserved by someone else." };
    }
    return { error: insertError.message };
  }

  const profile = await getCurrentProfile();
  await sendEmail({
    to: user.email!,
    ...reservationConfirmedEmail({
      name: profile?.full_name ?? user.email!,
      vehicleLabel,
      orderNo,
      totalUsd,
      reservedUntil,
    }),
  });

  revalidatePath("/stock");
  revalidatePath("/cars/[slug]", "page");
  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  return { error: null, success: true };
}

const CANCELLABLE_STATUSES = ["reserved", "awaiting_payment"] as const;

export async function cancelOrder(orderId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sign in required.");

  const reason = String(formData.get("reason") ?? "").trim() || null;
  const supabase = await createClient();
  const isStaff = profile.role === "admin" || profile.role === "sales";

  // Defense in depth on top of RLS (orders_update_owner_or_staff would also
  // block a non-owner, but only after matching zero rows and returning a
  // silent no-op success — the explicit filter + rowcount check below turns
  // that into a real error instead). Also guards against cancelling an
  // order that's already progressed past the reservation stage.
  let query = supabase
    .from("orders")
    .update({ status: "cancelled" as Enums["order_status"], cancel_reason: reason })
    .eq("id", orderId)
    .in("status", CANCELLABLE_STATUSES);
  if (!isStaff) query = query.eq("user_id", profile.id);

  const { data, error } = await query.select("id");
  if (error) throw new Error(`cancelOrder: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error("Order not found, not yours, or no longer cancellable.");
  }

  revalidatePath("/account/orders");
  revalidatePath("/account/invoices");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/stock");
  revalidatePath("/cars/[slug]", "page");
}

export async function setOrderStatus(orderId: string, status: (typeof ORDER_STATUSES)[number]) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: status as Enums["order_status"] })
    .eq("id", orderId);
  if (error) throw new Error(`setOrderStatus: ${error.message}`);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
