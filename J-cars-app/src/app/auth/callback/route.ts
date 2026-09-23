import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/recovery";
import { createClient } from "@/lib/supabase/server";

// Landing URL for Supabase password-recovery emails. The recovery template
// (supabase/templates/recovery.html) links here with a `token_hash`, which
// works on any device. A `code` is the PKCE fallback of Supabase's default
// template, and only works in the browser that requested the reset.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/account");

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && searchParams.get("type") === "recovery") {
    ok = !(await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? next : "/forgot-password?error=link", origin));
}
