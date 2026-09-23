import { describe, expect, it } from "vitest";

import { canTransition, nextStatuses } from "./constants";

describe("canTransition", () => {
  it.each([
    ["reserved", "awaiting_payment"],
    ["reserved", "cancelled"],
    ["awaiting_payment", "cancelled"],
    ["paid", "preparing_export"],
    ["preparing_export", "booked_shipping"],
    ["booked_shipping", "shipped"],
    ["shipped", "arrived"],
    ["arrived", "completed"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    // paid is only reachable through payment verification, never by hand.
    ["awaiting_payment", "paid"],
    ["reserved", "paid"],
    ["paid", "cancelled"],
    ["shipped", "cancelled"],
    ["completed", "cancelled"],
    ["cancelled", "reserved"],
    ["reserved", "shipped"],
    ["arrived", "shipped"],
    ["completed", "completed"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(canTransition("bogus", "cancelled")).toBe(false);
  });
});

describe("nextStatuses", () => {
  it("lists the manual transitions for a status", () => {
    expect(nextStatuses("reserved")).toEqual(["awaiting_payment", "cancelled"]);
  });

  it("returns nothing for terminal statuses", () => {
    expect(nextStatuses("completed")).toEqual([]);
    expect(nextStatuses("cancelled")).toEqual([]);
  });
});
