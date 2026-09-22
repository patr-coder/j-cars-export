"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error: string | null; success?: boolean };

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  preferredLanguage: z.string().trim().min(1),
  preferredCurrency: z.string().trim().min(1),
  consigneeName: z.string().trim().optional(),
  consigneeCompany: z.string().trim().optional(),
  consigneeAddress: z.string().trim().optional(),
  consigneeCity: z.string().trim().optional(),
  consigneeCountry: z.string().trim().optional(),
  consigneePhone: z.string().trim().optional(),
});

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      preferred_language: parsed.data.preferredLanguage,
      preferred_currency: parsed.data.preferredCurrency,
      consignee_name: parsed.data.consigneeName || null,
      consignee_company: parsed.data.consigneeCompany || null,
      consignee_address: parsed.data.consigneeAddress || null,
      consignee_city: parsed.data.consigneeCity || null,
      consignee_country: parsed.data.consigneeCountry || null,
      consignee_phone: parsed.data.consigneePhone || null,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { error: null, success: true };
}
