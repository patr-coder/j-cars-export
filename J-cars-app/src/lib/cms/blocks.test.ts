import { describe, expect, it } from "vitest";

import { parseContentBlocks } from "./blocks";

describe("parseContentBlocks", () => {
  it("returns no blocks for empty or whitespace-only text", () => {
    expect(parseContentBlocks("")).toEqual([]);
    expect(parseContentBlocks("  \n\n  ")).toEqual([]);
  });

  it("splits paragraphs on blank lines and joins wrapped lines", () => {
    expect(parseContentBlocks("First line\nsame paragraph\n\nSecond")).toEqual([
      { type: "paragraph", text: "First line same paragraph" },
      { type: "paragraph", text: "Second" },
    ]);
  });

  it("parses ## headings", () => {
    expect(parseContentBlocks("## Why us\nWe ship worldwide.")).toEqual([
      { type: "heading", text: "Why us" },
      { type: "paragraph", text: "We ship worldwide." },
    ]);
  });

  it("groups consecutive - lines into one list", () => {
    expect(parseContentBlocks("- One\n- Two\n\nAfter")).toEqual([
      { type: "list", items: ["One", "Two"] },
      { type: "paragraph", text: "After" },
    ]);
  });

  it("handles Windows line endings", () => {
    expect(parseContentBlocks("## A\r\n\r\nB")).toEqual([
      { type: "heading", text: "A" },
      { type: "paragraph", text: "B" },
    ]);
  });

  it("keeps markup as plain text", () => {
    expect(parseContentBlocks("<script>alert(1)</script>")).toEqual([
      { type: "paragraph", text: "<script>alert(1)</script>" },
    ]);
  });

  it("ignores an empty heading marker", () => {
    expect(parseContentBlocks("##\nText")).toEqual([{ type: "paragraph", text: "Text" }]);
  });
});
