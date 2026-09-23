"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/roles";
import { ROLES } from "@/lib/customers/constants";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

function back(error?: string): never {
  redirect(error ? `/admin/customers?error=${encodeURIComponent(error)}` : "/admin/customers");
}

// Role changes are admin-only in the DB too (prevent_role_self_escalation,
// migration 0011). An admin can't change their own role, so the last admin
// can't lock everyone out of /admin by accident.
export async function setUserRole(userId: string, formData: FormData) {
  const actor = await requireRole(["admin"]);
  const role = String(formData.get("role") ?? "") as Role;
  if (!ROLES.includes(role)) back("Unknown role.");
  if (userId === actor.id) back("You can't change your own role.");

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", userId).select("id");
  if (error) back(`Could not change role: ${error.message}`);
  if (!data?.length) back("User not found.");

  revalidatePath("/admin/customers");
  back();
}
