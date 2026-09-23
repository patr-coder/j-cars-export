import { describe, expect, it } from "vitest";

import { changedFields } from "./diff";

describe("changedFields", () => {
  it("lists every field of an insert", () => {
    expect(changedFields(null, { id: "1", status: "new" })).toEqual([
      { field: "id", before: undefined, after: "1" },
      { field: "status", before: undefined, after: "new" },
    ]);
  });

  it("lists every field of a delete", () => {
    expect(changedFields({ id: "1" }, null)).toEqual([{ field: "id", before: "1", after: undefined }]);
  });

  it("only lists fields that changed on an update", () => {
    expect(
      changedFields({ id: "1", status: "reserved", total_usd: 100 }, { id: "1", status: "paid", total_usd: 100 }),
    ).toEqual([{ field: "status", before: "reserved", after: "paid" }]);
  });

  it("ignores updated_at", () => {
    expect(changedFields({ a: 1, updated_at: "x" }, { a: 1, updated_at: "y" })).toEqual([]);
  });

  it("compares nested JSON by value", () => {
    expect(changedFields({ v: { a: [1, 2] } }, { v: { a: [1, 2] } })).toEqual([]);
    expect(changedFields({ v: { a: [1, 2] } }, { v: { a: [1, 3] } })).toEqual([
      { field: "v", before: { a: [1, 2] }, after: { a: [1, 3] } },
    ]);
  });

  it("treats both sides missing as no rows", () => {
    expect(changedFields(null, null)).toEqual([]);
  });
});
