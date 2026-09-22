"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(vehicleId: string, path: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to save favorites.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("vehicle_id")
    .eq("user_id", user.id)
    .eq("vehicle_id", vehicleId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("vehicle_id", vehicleId);
    if (error) throw new Error(`toggleFavorite: ${error.message}`);
  } else {
    const { error } = await supabase.from("favorites").insert({ user_id: user.id, vehicle_id: vehicleId });
    if (error) throw new Error(`toggleFavorite: ${error.message}`);
  }

  revalidatePath(path);
  revalidatePath("/account/favorites");
}
