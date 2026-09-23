import { describe, expect, it } from "vitest";

import { canOptimize } from "./optimize";

describe("canOptimize", () => {
  it("optimizes hosted Supabase Storage URLs", () => {
    expect(canOptimize("https://abc.supabase.co/storage/v1/object/public/vehicle-images/x.jpg")).toBe(true);
  });

  it("skips the local Supabase stack, which the optimizer refuses to fetch", () => {
    expect(canOptimize("http://127.0.0.1:56321/storage/v1/object/public/vehicle-images/x.jpg")).toBe(false);
    expect(canOptimize("http://localhost:56321/storage/v1/object/public/x.jpg")).toBe(false);
  });

  it("skips anything that isn't an absolute https URL", () => {
    expect(canOptimize("not a url")).toBe(false);
    expect(canOptimize("http://example.com/x.jpg")).toBe(false);
  });
});
