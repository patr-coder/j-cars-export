import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("serializes plain data as JSON", () => {
    expect(JSON.parse(serializeJsonLd({ name: "Toyota" }))).toEqual({ name: "Toyota" });
  });

  it("can't close the surrounding <script> tag", () => {
    const out = serializeJsonLd({ description: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ description: "</script><script>alert(1)</script>" });
  });

  it("escapes HTML comment openers and line separators", () => {
    const out = serializeJsonLd({ a: "<!-- x", b: "line\u2028sep\u2029" });
    expect(out).not.toMatch(/<|\u2028|\u2029/);
    expect(JSON.parse(out)).toEqual({ a: "<!-- x", b: "line\u2028sep\u2029" });
  });
});
