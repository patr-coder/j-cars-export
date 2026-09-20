import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";
import type { Profile, Role } from "@/types";

/**
 * Server-side guard for a layout/page. Redirects to /login when signed out,
 * or to / when signed in but not in `allowed`. This is the actual security
 * boundary — the proxy only refreshes the session, it does not gate routes
 * (see src/proxy.ts and the Next.js data-security guide: Server Functions
 * are not separate routes, so every action must check this too).
 */
export async function requireRole(allowed: Role[]): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!allowed.includes(profile.role)) {
    redirect("/");
  }

  return profile;
}
