import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Renamed from `middleware.ts` — Next.js 16 deprecated the `middleware`
// convention in favor of `proxy`. See node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
