// `next` comes from a URL the user clicked, so only same-site paths are
// followed. Backslashes and whitespace are refused because browsers turn
// "/\host" and "/<tab>/host" into the off-site "//host".
const SAME_SITE_PATH_RE = /^\/(?!\/)[^\s\\]*$/;

export function safeNextPath(raw: string | null, fallback: string): string {
  return raw && SAME_SITE_PATH_RE.test(raw) ? raw : fallback;
}

export const RECOVERY_WINDOW_SECONDS = 15 * 60;

type AmrClaim = { method: string; timestamp: number } | string;

// What GoTrue records for an emailed recovery link: "recovery" after a PKCE
// code exchange, "otp" after a token_hash verification. This app offers no
// OTP or magic-link sign-in, so either means "just proved inbox control".
const RECOVERY_METHODS = new Set(["recovery", "otp"]);

// A password may only be set without the old one right after the user
// proved control of their inbox, and only for a short while after.
export function isFreshRecovery(amr: readonly AmrClaim[] | undefined, nowSeconds: number): boolean {
  return (amr ?? []).some(
    (entry) =>
      typeof entry === "object" &&
      RECOVERY_METHODS.has(entry.method) &&
      nowSeconds - entry.timestamp <= RECOVERY_WINDOW_SECONDS,
  );
}
