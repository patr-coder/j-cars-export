import { createClient } from "@/lib/supabase/server";

export type BankDetails = {
  bank_name: string;
  account_name: string;
  account_no: string;
  swift: string;
  branch: string;
  note: string;
};

// Seeded by migration 0012; editable from the Phase 6 CMS.
export async function getBankDetails(): Promise<BankDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value_json")
    .eq("key", "bank_details")
    .maybeSingle();
  if (error) throw new Error(`getBankDetails: ${error.message}`);
  return (data?.value_json as BankDetails | undefined) ?? null;
}
