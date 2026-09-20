import { defineConfig } from "@playwright/test";

// No specs yet — Phase 0 only wires the runner. Real E2E coverage
// (spec §17) lands with the flows it's testing, phase by phase.
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
