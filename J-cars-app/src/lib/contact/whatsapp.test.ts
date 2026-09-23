import { describe, expect, it } from "vitest";

import { whatsappHref } from "./whatsapp";

describe("whatsappHref", () => {
  it("returns null when no number is configured", () => {
    expect(whatsappHref("")).toBeNull();
    expect(whatsappHref("   ")).toBeNull();
  });

  it("strips formatting down to digits", () => {
    expect(whatsappHref("+81 90-1234-5678")).toBe("https://wa.me/819012345678");
  });

  it("rejects numbers too short or too long to be international", () => {
    expect(whatsappHref("12345")).toBeNull();
    expect(whatsappHref("1234567890123456")).toBeNull();
  });

  it("drops a leading international 00 prefix", () => {
    expect(whatsappHref("0081 90 1234 5678")).toBe("https://wa.me/819012345678");
  });

  it("url-encodes the prefilled message", () => {
    expect(whatsappHref("+819012345678", "Hi, about JC-0001 & price?")).toBe(
      "https://wa.me/819012345678?text=Hi%2C%20about%20JC-0001%20%26%20price%3F",
    );
  });
});
