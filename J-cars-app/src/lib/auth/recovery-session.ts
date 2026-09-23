import "server-only";

import { isFreshRecovery } from "@/lib/auth/recovery";
import { createClient } from "@/lib/supabase/server";

// Shared by /reset-password and updatePassword so both apply the same rule.
export async function hasFreshRecoverySession(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const amr = data?.claims.amr as { method: string; timestamp: number }[] | undefined;
  return isFreshRecovery(amr, Math.floor(Date.now() / 1000));
}
