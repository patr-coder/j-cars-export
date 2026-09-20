import { describe, expect, it } from "vitest";

import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats USD with no decimal places", () => {
    expect(formatCurrency(12500, "USD")).toBe("$12,500");
  });

  it("formats a different currency", () => {
    expect(formatCurrency(9999, "EUR", "en-US")).toBe("€9,999");
  });

  it("rounds to the nearest whole unit", () => {
    expect(formatCurrency(12500.75, "USD")).toBe("$12,501");
  });
});
