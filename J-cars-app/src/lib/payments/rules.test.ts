import { describe, expect, it } from "vitest";

import { isFullyPaid, remainingBalance, verifiedTotal } from "./rules";

const p = (amount: number, status: "pending" | "verified" | "rejected") => ({ amount, status });

describe("verifiedTotal", () => {
  it("sums only verified payments", () => {
    expect(verifiedTotal([p(1000, "verified"), p(500, "pending"), p(700, "rejected"), p(250, "verified")])).toBe(
      1250,
    );
  });

  it("is zero with no payments", () => {
    expect(verifiedTotal([])).toBe(0);
  });

  it("does not drift on cents", () => {
    expect(verifiedTotal([p(0.1, "verified"), p(0.2, "verified")])).toBe(0.3);
  });
});

describe("isFullyPaid", () => {
  it("is true when verified payments exactly cover the total", () => {
    expect(isFullyPaid(12000, [p(5000, "verified"), p(7000, "verified")])).toBe(true);
  });

  it("is true when verified payments exceed the total", () => {
    expect(isFullyPaid(12000, [p(12500, "verified")])).toBe(true);
  });

  it("ignores pending and rejected payments", () => {
    expect(isFullyPaid(12000, [p(5000, "verified"), p(7000, "pending"), p(7000, "rejected")])).toBe(false);
  });

  it("is false with no payments", () => {
    expect(isFullyPaid(12000, [])).toBe(false);
  });
});

describe("remainingBalance", () => {
  it("subtracts verified payments from the total", () => {
    expect(remainingBalance(12000, [p(5000, "verified"), p(3000, "pending")])).toBe(7000);
  });

  it("never goes below zero", () => {
    expect(remainingBalance(12000, [p(13000, "verified")])).toBe(0);
  });
});
