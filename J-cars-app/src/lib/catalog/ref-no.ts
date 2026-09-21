import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Matches scripts/seed.ts's format (JC-0001, JC-0002, ...). Reads every
// existing ref_no rather than just the max string sort, since "JC-9"
// would otherwise sort after "JC-10" as text.
export async function getNextRefNo(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const { data, error } = await supabase.from("vehicles").select("ref_no");
  if (error) throw new Error(`getNextRefNo: ${error.message}`);

  const maxSuffix = (data ?? []).reduce((max, row) => {
    const match = /^JC-(\d+)$/.exec(row.ref_no);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `JC-${String(maxSuffix + 1).padStart(4, "0")}`;
}
