import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Service-role client factory, without the `server-only` guard (see
 * admin.ts) — imported directly by scripts/seed.ts, which runs under plain
 * Node/tsx rather than Next's bundler, where `server-only` no-ops.
 */
export function createAdminSupabaseClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
