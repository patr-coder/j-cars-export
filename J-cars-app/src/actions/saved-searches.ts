"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SavedSearchActionState = { error: string | null; success?: boolean };

const saveSearchSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  filtersJson: z.string(),
  emailAlerts: z.string().optional(),
});

export async function saveSearch(
  _prevState: SavedSearchActionState,
  formData: FormData,
): Promise<SavedSearchActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to save searches." };

  const parsed = saveSearchSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let filters: Record<string, string>;
  try {
    filters = JSON.parse(parsed.data.filtersJson);
  } catch {
    return { error: "Invalid filters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    name: parsed.data.name,
    filters_json: filters,
    email_alerts: parsed.data.emailAlerts === "on",
  });
  if (error) return { error: error.message };

  revalidatePath("/account/searches");
  return { error: null, success: true };
}

export async function deleteSavedSearch(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to manage saved searches.");

  const supabase = await createClient();
  const { error } = await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(`deleteSavedSearch: ${error.message}`);

  revalidatePath("/account/searches");
}
