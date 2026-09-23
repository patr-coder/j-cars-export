import { describe, expect, it } from "vitest";

import {
  alertBannerSchema,
  contactSchema,
  DEFAULT_SETTINGS,
  heroSchema,
  parseSetting,
} from "./schema";

describe("parseSetting", () => {
  it("falls back to defaults when the row is missing", () => {
    expect(parseSetting("hero", undefined)).toEqual(DEFAULT_SETTINGS.hero);
  });

  it("falls back to defaults when the stored JSON is malformed", () => {
    expect(parseSetting("alert_banner", { enabled: "yes" })).toEqual(DEFAULT_SETTINGS.alert_banner);
  });

  it("fills missing fields from defaults", () => {
    expect(parseSetting("contact", { email: "sales@example.com" })).toEqual({
      ...DEFAULT_SETTINGS.contact,
      email: "sales@example.com",
    });
  });

  it("parses FAQ items", () => {
    const items = [{ id: "a", question: "Q?", answer: "A." }];
    expect(parseSetting("faq", { items })).toEqual({ items });
  });
});

describe("contactSchema", () => {
  it("accepts empty values (not configured)", () => {
    expect(contactSchema.safeParse(DEFAULT_SETTINGS.contact).success).toBe(true);
  });

  it("requires https for social links", () => {
    expect(contactSchema.safeParse({ ...DEFAULT_SETTINGS.contact, facebook: "https://facebook.com/jcars" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...DEFAULT_SETTINGS.contact, facebook: "http://facebook.com/jcars" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...DEFAULT_SETTINGS.contact, instagram: "javascript:alert(1)" }).success).toBe(false);
  });

  it("validates the email", () => {
    expect(contactSchema.safeParse({ ...DEFAULT_SETTINGS.contact, email: "not-an-email" }).success).toBe(false);
  });
});

describe("hero/banner link validation", () => {
  const SHOULD_ACCEPT = [
    ["empty (no link)", ""],
    ["site path", "/stock"],
    ["site path with query", "/stock?make=toyota&promotion=1"],
    ["site path with hash", "/how-to-buy#pay"],
    ["https URL", "https://example.com/page"],
  ];
  const SHOULD_REJECT = [
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>alert(1)</script>"],
    ["plain http", "http://example.com"],
    ["protocol-relative", "//evil.example"],
    ["backslash host (browsers read it as //)", "/\\evil.example"],
    ["mixed slash/backslash", "\\/evil.example"],
    ["tab inside scheme-relative", "/\t/evil.example"],
    ["relative without slash", "stock"],
    ["https with spaces", "https://exa mple.com"],
  ];

  it.each(SHOULD_ACCEPT)("accepts %s", (_label, value) => {
    expect(heroSchema.safeParse({ ...DEFAULT_SETTINGS.hero, cta_url: value }).success).toBe(true);
  });

  it.each(SHOULD_REJECT)("rejects %s", (_label, value) => {
    expect(heroSchema.safeParse({ ...DEFAULT_SETTINGS.hero, cta_url: value }).success).toBe(false);
  });
});

describe("link fields", () => {
  it("allow site-relative paths and https URLs only", () => {
    const base = DEFAULT_SETTINGS.hero;
    expect(heroSchema.safeParse({ ...base, cta_url: "/stock?make=toyota" }).success).toBe(true);
    expect(heroSchema.safeParse({ ...base, cta_url: "https://example.com" }).success).toBe(true);
    expect(heroSchema.safeParse({ ...base, cta_url: "javascript:alert(1)" }).success).toBe(false);
    expect(heroSchema.safeParse({ ...base, cta_url: "//evil.example" }).success).toBe(false);
  });

  it("require a message when the alert banner is enabled", () => {
    const base = DEFAULT_SETTINGS.alert_banner;
    expect(alertBannerSchema.safeParse({ ...base, enabled: true, message: "" }).success).toBe(false);
    expect(alertBannerSchema.safeParse({ ...base, enabled: true, message: "Closed Monday" }).success).toBe(true);
  });
});
