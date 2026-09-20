import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Service-role client. Bypasses RLS entirely — never import this from
 * anything that ends up in a client bundle (the `server-only` import above
 * makes that a build error, not just a review nit).
 */
export function createAdminClient() {
  return createAdminSupabaseClient();
}
