"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/resend";
import { quoteReadyEmail } from "@/lib/email/templates";
import { calculateQuoteTotal, type ShippingRateForCalc } from "@/lib/pricing/calculator";
import { QUOTE_STATUSES } from "@/lib/quotes/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type QuoteActionState = { error: string | null; success?: boolean };

// quotes_write_staff / inquiries_update_staff (migration 0006) grant
// admin+sales — same role set for both tables in this workflow.
const STAFF_ROLES = ["admin", "sales"] as const;

function numberOrZero(formData: FormData, key: string): number {
  const n = Number(formData.get(key));
  return Number.isFinite(n) ? n : 0;
}

export async function createQuoteFromInquiry(
  inquiryId: string,
  _prevState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, vehicle_id, user_id, vehicle:vehicles(location_id)")
    .eq("id", inquiryId)
    .single();
  if (inquiryError || !inquiry.vehicle_id) {
    return { error: "This inquiry has no vehicle attached — a quote needs one." };
  }
  const vehicleLocationId = (inquiry.vehicle as unknown as { location_id: string | null } | null)
    ?.location_id;

  const shippingRateId = String(formData.get("shippingRateId") ?? "");
  if (!shippingRateId) return { error: "Select a shipping rate." };

  const { data: rate, error: rateError } = await supabase
    .from("shipping_rates")
    .select(
      "origin_location_id, base_cost_usd, insurance_rate, inspection_fee_usd, certificate_fee_usd, local_export_fee_usd",
    )
    .eq("id", shippingRateId)
    .single();
  if (rateError) return { error: `Shipping rate: ${rateError.message}` };
  if (!vehicleLocationId || rate.origin_location_id !== vehicleLocationId) {
    return { error: "That shipping rate doesn't originate from this vehicle's location." };
  }

  const rateForCalc: ShippingRateForCalc = {
    baseCostUsd: Number(rate.base_cost_usd),
    m3Rate: null,
    insuranceRate: rate.insurance_rate === null ? null : Number(rate.insurance_rate),
    inspectionFeeUsd: rate.inspection_fee_usd === null ? null : Number(rate.inspection_fee_usd),
    certificateFeeUsd: rate.certificate_fee_usd === null ? null : Number(rate.certificate_fee_usd),
    localExportFeeUsd: rate.local_export_fee_usd === null ? null : Number(rate.local_export_fee_usd),
  };

  const vehiclePrice = numberOrZero(formData, "vehiclePrice");
  const breakdown = calculateQuoteTotal(vehiclePrice, rateForCalc, {
    insurance: formData.get("insurance") === "on",
    inspection: formData.get("inspection") === "on",
    certificate: formData.get("certificate") === "on",
  });
  const otherFees = breakdown.localExportFee + numberOrZero(formData, "otherFees");
  const discount = numberOrZero(formData, "discount");
  const expiresAt = String(formData.get("expiresAt") ?? "") || null;

  const profile = await getCurrentProfile();
  const { data: created, error } = await supabase
    .from("quotes")
    .insert({
      inquiry_id: inquiry.id,
      vehicle_id: inquiry.vehicle_id,
      user_id: inquiry.user_id,
      vehicle_price: vehiclePrice,
      freight: breakdown.freight,
      insurance: breakdown.insurance,
      inspection: breakdown.inspection,
      certificate: breakdown.certificate,
      other_fees: otherFees,
      discount,
      total_usd: vehiclePrice + breakdown.freight + breakdown.insurance + breakdown.inspection + breakdown.certificate + otherFees - discount,
      expires_at: expiresAt,
      created_by: profile?.id ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/admin/quotes");
  revalidatePath("/admin/inquiries");
  redirect(`/admin/quotes/${created.id}/edit`);
}

export async function updateQuote(
  id: string,
  _prevState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  await requireRole(STAFF_ROLES);

  const vehiclePrice = numberOrZero(formData, "vehiclePrice");
  const freight = numberOrZero(formData, "freight");
  const insurance = numberOrZero(formData, "insurance");
  const inspection = numberOrZero(formData, "inspection");
  const certificate = numberOrZero(formData, "certificate");
  const otherFees = numberOrZero(formData, "otherFees");
  const discount = numberOrZero(formData, "discount");
  const expiresAt = String(formData.get("expiresAt") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      vehicle_price: vehiclePrice,
      freight,
      insurance,
      inspection,
      certificate,
      other_fees: otherFees,
      discount,
      total_usd: vehiclePrice + freight + insurance + inspection + certificate + otherFees - discount,
      expires_at: expiresAt,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/quotes/${id}/edit`);
  revalidatePath("/admin/quotes");
  return { error: null, success: true };
}

export async function sendQuote(id: string) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select(
      "id, inquiry_id, user_id, vehicle_price, freight, insurance, inspection, certificate, other_fees, discount, total_usd, expires_at, vehicle:vehicles ( year, make:makes(name), model:models(name) )",
    )
    .eq("id", id)
    .single();
  if (quoteError) throw new Error(`sendQuote: ${quoteError.message}`);

  const q = quote as unknown as {
    id: string;
    inquiry_id: string | null;
    user_id: string | null;
    vehicle_price: number;
    freight: number;
    insurance: number;
    inspection: number;
    certificate: number;
    other_fees: number;
    discount: number;
    total_usd: number;
    expires_at: string | null;
    vehicle: { year: number; make: { name: string }; model: { name: string } };
  };
  const vehicleLabel = `${q.vehicle.year} ${q.vehicle.make.name} ${q.vehicle.model.name}`;

  let recipientEmail: string | null = null;
  let recipientName = "there";
  if (q.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", q.user_id)
      .maybeSingle();
    if (profile) {
      recipientEmail = profile.email;
      recipientName = profile.full_name ?? recipientName;
    }
  }
  if (!recipientEmail && q.inquiry_id) {
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("email, name")
      .eq("id", q.inquiry_id)
      .maybeSingle();
    if (inquiry) {
      recipientEmail = inquiry.email;
      recipientName = inquiry.name;
    }
  }
  if (!recipientEmail) throw new Error("sendQuote: no recipient email found for this quote.");

  await sendEmail({
    to: recipientEmail,
    ...quoteReadyEmail({
      name: recipientName,
      vehicleLabel,
      vehiclePrice: Number(q.vehicle_price),
      freight: Number(q.freight),
      insurance: Number(q.insurance),
      inspection: Number(q.inspection),
      certificate: Number(q.certificate),
      otherFees: Number(q.other_fees),
      discount: Number(q.discount),
      totalUsd: Number(q.total_usd),
      expiresAt: q.expires_at,
    }),
  });

  const { error: sentError } = await supabase
    .from("quotes")
    .update({ status: "sent" as Enums["quote_status"] })
    .eq("id", id);
  if (sentError) throw new Error(`sendQuote: ${sentError.message}`);

  if (q.inquiry_id) {
    await supabase
      .from("inquiries")
      .update({ status: "quoted" as Enums["inquiry_status"] })
      .eq("id", q.inquiry_id);
  }

  revalidatePath(`/admin/quotes/${id}/edit`);
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/inquiries");
}

export async function setQuoteStatus(id: string, status: (typeof QUOTE_STATUSES)[number]) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status: status as Enums["quote_status"] })
    .eq("id", id);
  if (error) throw new Error(`setQuoteStatus: ${error.message}`);

  revalidatePath(`/admin/quotes/${id}/edit`);
  revalidatePath("/admin/quotes");
}
