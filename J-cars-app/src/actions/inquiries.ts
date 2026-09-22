"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/resend";
import { inquiryReceivedEmail } from "@/lib/email/templates";
import { INQUIRY_STATUSES } from "@/lib/inquiries/constants";
import { PHONE_COUNTRIES } from "@/lib/phone/countries";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type InquiryActionState = { error: string | null; success?: boolean };

// inquiries_update_staff (migration 0006) grants update to admin+sales —
// inquiries_insert_anyone means submitInquiry itself needs no role check.
const STAFF_ROLES = ["admin", "sales"] as const;

const inquirySchema = z.object({
  vehicleId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phoneCountry: z.string().optional(),
  phoneNumber: z.string().trim().optional(),
  message: z.string().trim().optional(),
  // Honeypot — a real visitor never sees or fills this field (hidden via
  // CSS in InquiryForm); a bot filling every input will. Not a full
  // anti-abuse solution on its own, paired with the rate limit below.
  company: z.string().optional(),
});

// This is the app's only fully anonymous write+send path (RLS's
// inquiries_insert_anyone). Without some throttle, it's an open mailer:
// repeated submissions with someone else's email would email-bomb them
// with "we've received your request" messages under this site's name.
// A per-email cap is cheap (no new infra) and blocks that specific abuse;
// a CAPTCHA/per-IP throttle is a documented follow-up, not silently
// dropped — see DECISIONS.md.
const INQUIRY_RATE_LIMIT = 5;
const INQUIRY_RATE_WINDOW_MS = 60 * 60 * 1000;

export async function submitInquiry(
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (parsed.data.company) {
    // Honeypot tripped — report success so the bot doesn't learn to
    // retry, but don't write anything or send an email.
    return { error: null, success: true };
  }

  const supabase = await createClient();

  const { count: recentCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", parsed.data.email)
    .gte("created_at", new Date(Date.now() - INQUIRY_RATE_WINDOW_MS).toISOString());
  if ((recentCount ?? 0) >= INQUIRY_RATE_LIMIT) {
    return { error: "Too many requests from this email — please try again later." };
  }

  const profile = await getCurrentProfile();
  const vehicleId = parsed.data.vehicleId || null;

  let vehicleLabel: string | null = null;
  if (vehicleId) {
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("year, make:makes(name), model:models(name)")
      .eq("id", vehicleId)
      .maybeSingle();
    const v = vehicle as unknown as { year: number; make: { name: string }; model: { name: string } } | null;
    if (v) vehicleLabel = `${v.year} ${v.make.name} ${v.model.name}`;
  }

  const dialCode = PHONE_COUNTRIES.find((c) => c.iso2 === parsed.data.phoneCountry)?.dialCode;
  const phone = parsed.data.phoneNumber
    ? dialCode
      ? `+${dialCode} ${parsed.data.phoneNumber}`
      : parsed.data.phoneNumber
    : null;

  const { error } = await supabase.from("inquiries").insert({
    user_id: profile?.id ?? null,
    vehicle_id: vehicleId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone,
    message: parsed.data.message || null,
  });
  if (error) {
    return { error: error.message };
  }

  await sendEmail({
    to: parsed.data.email,
    ...inquiryReceivedEmail({ name: parsed.data.name, vehicleLabel }),
  });

  revalidatePath("/admin/inquiries");
  return { error: null, success: true };
}

export async function assignInquiry(id: string, formData: FormData) {
  await requireRole(STAFF_ROLES);
  const assigneeId = String(formData.get("assigneeId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ assigned_to: assigneeId || null, status: "assigned" as Enums["inquiry_status"] })
    .eq("id", id);
  if (error) throw new Error(`assignInquiry: ${error.message}`);

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function setInquiryStatus(id: string, status: (typeof INQUIRY_STATUSES)[number]) {
  await requireRole(STAFF_ROLES);
  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: status as Enums["inquiry_status"] })
    .eq("id", id);
  if (error) throw new Error(`setInquiryStatus: ${error.message}`);

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}
