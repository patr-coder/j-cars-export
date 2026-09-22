import { createClient } from "@/lib/supabase/server";

export type SavedSearch = {
  id: string;
  name: string;
  filtersJson: Record<string, string>;
  emailAlerts: boolean;
  createdAt: string;
};

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, filters_json, email_alerts, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getSavedSearches: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    filtersJson: (row.filters_json ?? {}) as Record<string, string>,
    emailAlerts: row.email_alerts,
    createdAt: row.created_at,
  }));
}
