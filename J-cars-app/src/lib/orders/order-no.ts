import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Same reasoning as getNextRefNo (src/lib/catalog/ref-no.ts): parses and
// maxes numerically rather than sorting order_no as text, since "ORD-9"
// would otherwise sort after "ORD-10".
export async function getNextOrderNo(supabase: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await supabase.from("orders").select("order_no");
  if (error) throw new Error(`getNextOrderNo: ${error.message}`);

  const maxSuffix = (data ?? []).reduce((max, row) => {
    const match = /^ORD-(\d+)$/.exec(row.order_no);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `ORD-${String(maxSuffix + 1).padStart(4, "0")}`;
}
