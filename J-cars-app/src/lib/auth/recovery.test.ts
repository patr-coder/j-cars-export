import { describe, expect, it } from "vitest";

import { passwordSchema } from "./password";
import { isFreshRecovery, safeNextPath } from "./recovery";

describe("safeNextPath", () => {
  const SHOULD_KEEP = [
    ["reset page", "/reset-password"],
    ["account page with query", "/account/orders?tab=paid"],
  ];
  const SHOULD_FALL_BACK = [
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.example/phish"],
    ["protocol-relative", "//evil.example"],
    ["backslash host", "/\\evil.example"],
    ["tab trick", "/\t/evil.example"],
    ["javascript scheme", "javascript:alert(1)"],
    ["relative without slash", "account"],
  ];

  it.each(SHOULD_KEEP)("keeps %s", (_label, value) => {
    expect(safeNextPath(value, "/account")).toBe(value);
  });

  it.each(SHOULD_FALL_BACK)("falls back on %s", (_label, value) => {
    expect(safeNextPath(value, "/account")).toBe("/account");
  });
});

describe("passwordSchema", () => {
  it("accepts a 10+ character password with letters and digits", () => {
    expect(passwordSchema.safeParse("export2026cars").success).toBe(true);
  });

  it.each([
    ["too short", "abc12345"],
    ["letters only", "abcdefghijkl"],
    ["digits only", "123456789012"],
    ["too long for bcrypt", `a1${"x".repeat(71)}`],
  ])("rejects %s", (_label, value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });
});

describe("isFreshRecovery", () => {
  const now = 1_800_000_000;

  it("accepts a recovery sign-in from the last 15 minutes", () => {
    expect(isFreshRecovery([{ method: "recovery", timestamp: now - 60 }], now)).toBe(true);
  });

  it("accepts the otp method a token_hash recovery link produces", () => {
    expect(isFreshRecovery([{ method: "otp", timestamp: now - 60 }], now)).toBe(true);
  });

  it("refuses a normal password session", () => {
    expect(isFreshRecovery([{ method: "password", timestamp: now - 60 }], now)).toBe(false);
  });

  it("refuses a recovery sign-in older than 15 minutes", () => {
    expect(isFreshRecovery([{ method: "recovery", timestamp: now - 16 * 60 }], now)).toBe(false);
  });

  it("refuses missing or string-format claims (no timestamp to check)", () => {
    expect(isFreshRecovery(undefined, now)).toBe(false);
    expect(isFreshRecovery(["recovery"], now)).toBe(false);
  });
});
