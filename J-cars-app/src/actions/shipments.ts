"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/resend";
import { etaUpdatedEmail } from "@/lib/email/templates";
import { SHIPMENT_STATUSES } from "@/lib/shipments/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

const STAFF_ROLES = ["admin", "sales"] as const;

function text(formData: FormData, key: string): string | null {
  return String(formData.get(key) ?? "").trim().slice(0, 200) || null;
}

function date(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

// Rendered as a link on the client's order page — only https, so a
// javascript: or data: URL typed by staff can't end up in an href.
function httpsUrl(formData: FormData, key: string): string | null | undefined {
  const raw = text(formData, key);
  if (!raw) return null;
  try {
    return new URL(raw).protocol === "https:" ? raw : undefined;
  } catch {
    return undefined;
  }
}

export async function upsertShipment(orderId: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const back = `/admin/orders/${orderId}`;

  const status = String(formData.get("status") ?? "");
  if (!(SHIPMENT_STATUSES as readonly string[]).includes(status)) {
    redirect(`${back}?error=${encodeURIComponent("Invalid shipment status.")}`);
  }
  const trackingUrl = httpsUrl(formData, "trackingUrl");
  if (trackingUrl === undefined) {
    redirect(`${back}?error=${encodeURIComponent("Tracking URL must start with https://")}`);
  }
  const eta = date(formData, "eta");

  const supabase = await createClient();
  const [{ data: order, error: orderError }, { data: existing }] = await Promise.all([
    supabase.from("orders").select("order_no, user:profiles ( full_name, email )").eq("id", orderId).maybeSingle(),
    supabase.from("shipments").select("eta").eq("order_id", orderId).maybeSingle(),
  ]);
  if (orderError || !order) {
    redirect(`${back}?error=${encodeURIComponent(orderError?.message ?? "Order not found.")}`);
  }
  const current = order as unknown as {
    order_no: string;
    user: { full_name: string | null; email: string } | null;
  };
  const previousEta = existing?.eta ?? null;

  const { error } = await supabase.from("shipments").upsert(
    {
      order_id: orderId,
      carrier: text(formData, "carrier"),
      vessel_name: text(formData, "vesselName"),
      voyage_no: text(formData, "voyageNo"),
      booking_no: text(formData, "bookingNo"),
      origin_port: text(formData, "originPort"),
      destination_port: text(formData, "destinationPort"),
      etd: date(formData, "etd"),
      eta,
      status: status as Enums["shipment_status"],
      tracking_url: trackingUrl,
    },
    { onConflict: "order_id" },
  );
  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);

  // Only a change to an ETA the client was already told about is news;
  // the first ETA arrives with the "shipped" email instead.
  if (previousEta && eta && eta !== previousEta && current.user) {
    await sendEmail({
      to: current.user.email,
      ...etaUpdatedEmail({
        name: current.user.full_name ?? current.user.email,
        orderNo: current.order_no,
        eta,
      }),
    });
  }

  revalidatePath(back);
  revalidatePath(`/account/orders/${orderId}`);
  redirect(back);
}
